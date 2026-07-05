-- Household invites: email invites with editor/viewer roles, accept/decline flow.
-- Billing model: flat household plan + member slot quota (Plus: 2, Pro: unlimited).

create table if not exists public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  invited_email text not null,
  role text not null check (role in ('editor', 'viewer')),
  invited_by_user_id uuid not null references auth.users (id) on delete cascade,
  token text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'revoked')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  responded_at timestamptz,
  constraint household_invites_token_key unique (token)
);

create index if not exists household_invites_household_id_idx
  on public.household_invites (household_id);

create index if not exists household_invites_email_pending_idx
  on public.household_invites (lower(invited_email))
  where status = 'pending';

create unique index if not exists household_invites_pending_email_per_household
  on public.household_invites (household_id, lower(invited_email))
  where status = 'pending';

alter table public.household_invites enable row level security;

-- ---------------------------------------------------------------------------
-- Quota helpers
-- ---------------------------------------------------------------------------

create or replace function public.household_member_slot_count(p_household_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select
    (
      select count(*)::integer
      from public.household_members hm
      where hm.household_id = p_household_id
        and hm.role <> 'owner'
    )
    +
    (
      select count(*)::integer
      from public.household_invites hi
      where hi.household_id = p_household_id
        and hi.status = 'pending'
        and hi.expires_at > now()
    );
$$;

create or replace function public.enforce_household_invite_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  billing_owner uuid;
  plan text;
  slot_limit integer;
  slot_count integer;
begin
  select h.billing_owner_user_id
  into billing_owner
  from public.households h
  where h.id = new.household_id;

  if billing_owner is null then
    raise exception 'Household not found.'
      using errcode = 'P0001';
  end if;

  plan := public.resolve_commercial_plan(billing_owner);

  if plan not in ('plus', 'pro', 'enterprise') then
    raise exception 'Household invites require Plus or above.'
      using errcode = 'P0001';
  end if;

  slot_count := public.household_member_slot_count(new.household_id);

  if plan = 'plus' then
    slot_limit := 2;
    if slot_count >= slot_limit then
      raise exception 'Household member limit reached. Upgrade to Pro for unlimited seats.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_household_invite_quota on public.household_invites;

create trigger enforce_household_invite_quota
  before insert on public.household_invites
  for each row
  execute function public.enforce_household_invite_quota();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

drop policy if exists "Owners read household invites" on public.household_invites;
drop policy if exists "Owners manage household invites" on public.household_invites;
drop policy if exists "Invitees read own pending invites" on public.household_invites;

create policy "Owners read household invites"
  on public.household_invites
  for select
  using (public.is_household_owner(household_id));

create policy "Owners manage household invites"
  on public.household_invites
  for all
  using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

create policy "Invitees read own pending invites"
  on public.household_invites
  for select
  using (
    status = 'pending'
    and lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

create or replace function public.get_my_primary_household()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'id', h.id,
    'name', h.name,
    'planTier', h.plan_tier,
    'billingOwnerUserId', h.billing_owner_user_id,
    'myRole', hm.role
  )
  into result
  from public.household_members hm
  inner join public.households h on h.id = hm.household_id
  where hm.user_id = auth.uid()
  order by hm.joined_at asc
  limit 1;

  return result;
end;
$$;

create or replace function public.list_household_members(p_household_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_household_member(p_household_id) then
    raise exception 'Not authorized for this household.'
      using errcode = 'P0001';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'userId', hm.user_id,
          'role', hm.role,
          'joinedAt', hm.joined_at,
          'name', coalesce(nullif(trim(p.name), ''), 'Member'),
          'email', coalesce(p.email, '')
        )
        order by
          case hm.role when 'owner' then 0 when 'editor' then 1 else 2 end,
          hm.joined_at asc
      )
      from public.household_members hm
      left join public.profiles p on p.user_id = hm.user_id
      where hm.household_id = p_household_id
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.list_household_invites(p_household_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  if not public.is_household_owner(p_household_id) then
    raise exception 'Only the household owner can view invites.'
      using errcode = 'P0001';
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', hi.id,
          'invitedEmail', hi.invited_email,
          'role', hi.role,
          'status', hi.status,
          'token', hi.token,
          'createdAt', hi.created_at,
          'expiresAt', hi.expires_at
        )
        order by hi.created_at desc
      )
      from public.household_invites hi
      where hi.household_id = p_household_id
        and hi.status = 'pending'
        and hi.expires_at > now()
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.list_my_pending_household_invites()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  user_email text;
begin
  user_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if user_email = '' then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', hi.id,
          'token', hi.token,
          'householdId', hi.household_id,
          'householdName', h.name,
          'role', hi.role,
          'invitedEmail', hi.invited_email,
          'inviterName', coalesce(nullif(trim(inviter.name), ''), 'Household owner'),
          'createdAt', hi.created_at,
          'expiresAt', hi.expires_at
        )
        order by hi.created_at desc
      )
      from public.household_invites hi
      inner join public.households h on h.id = hi.household_id
      left join public.profiles inviter on inviter.user_id = hi.invited_by_user_id
      where hi.status = 'pending'
        and hi.expires_at > now()
        and lower(hi.invited_email) = user_email
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.create_household_invite(
  p_household_id uuid,
  p_email text,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  invite_token text;
  invite_row public.household_invites%rowtype;
begin
  if not public.is_household_owner(p_household_id) then
    raise exception 'Only the household owner can send invites.'
      using errcode = 'P0001';
  end if;

  normalized_email := lower(trim(p_email));
  if normalized_email = '' or position('@' in normalized_email) = 0 then
    raise exception 'Enter a valid email address.'
      using errcode = 'P0001';
  end if;

  if p_role not in ('editor', 'viewer') then
    raise exception 'Invite role must be editor or viewer.'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.profiles p
    inner join public.household_members hm
      on hm.user_id = p.user_id
    where hm.household_id = p_household_id
      and lower(p.email) = normalized_email
  ) then
    raise exception 'This person is already a household member.'
      using errcode = 'P0001';
  end if;

  invite_token := replace(
    replace(
      replace(encode(gen_random_bytes(24), 'base64'), '+', '-'),
      '/',
      '_'
    ),
    '=',
    ''
  );

  insert into public.household_invites (
    household_id,
    invited_email,
    role,
    invited_by_user_id,
    token
  )
  values (
    p_household_id,
    normalized_email,
    p_role,
    auth.uid(),
    invite_token
  )
  returning * into invite_row;

  return jsonb_build_object(
    'id', invite_row.id,
    'invitedEmail', invite_row.invited_email,
    'role', invite_row.role,
    'status', invite_row.status,
    'token', invite_row.token,
    'createdAt', invite_row.created_at,
    'expiresAt', invite_row.expires_at
  );
end;
$$;

create or replace function public.revoke_household_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household uuid;
begin
  select household_id into target_household
  from public.household_invites
  where id = p_invite_id;

  if target_household is null then
    raise exception 'Invite not found.'
      using errcode = 'P0001';
  end if;

  if not public.is_household_owner(target_household) then
    raise exception 'Only the household owner can revoke invites.'
      using errcode = 'P0001';
  end if;

  update public.household_invites
  set status = 'revoked', responded_at = now()
  where id = p_invite_id
    and status = 'pending';
end;
$$;

create or replace function public.accept_household_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.household_invites%rowtype;
  user_email text;
begin
  user_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if user_email = '' then
    raise exception 'Authentication required.'
      using errcode = 'P0001';
  end if;

  select * into invite_row
  from public.household_invites
  where token = trim(p_token)
    and status = 'pending'
    and expires_at > now()
  for update;

  if invite_row.id is null then
    raise exception 'Invite not found or no longer valid.'
      using errcode = 'P0001';
  end if;

  if lower(invite_row.invited_email) <> user_email then
    raise exception 'This invite was sent to a different email address.'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.household_members hm
    where hm.household_id = invite_row.household_id
      and hm.user_id = auth.uid()
  ) then
    update public.household_invites
    set status = 'accepted', responded_at = now()
    where id = invite_row.id;

    return jsonb_build_object('householdId', invite_row.household_id, 'alreadyMember', true);
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (invite_row.household_id, auth.uid(), invite_row.role);

  update public.household_invites
  set status = 'accepted', responded_at = now()
  where id = invite_row.id;

  return jsonb_build_object('householdId', invite_row.household_id, 'alreadyMember', false);
end;
$$;

create or replace function public.decline_household_invite(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.household_invites%rowtype;
  user_email text;
begin
  user_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if user_email = '' then
    raise exception 'Authentication required.'
      using errcode = 'P0001';
  end if;

  select * into invite_row
  from public.household_invites
  where token = trim(p_token)
    and status = 'pending'
    and expires_at > now();

  if invite_row.id is null then
    raise exception 'Invite not found or no longer valid.'
      using errcode = 'P0001';
  end if;

  if lower(invite_row.invited_email) <> user_email then
    raise exception 'This invite was sent to a different email address.'
      using errcode = 'P0001';
  end if;

  update public.household_invites
  set status = 'declined', responded_at = now()
  where id = invite_row.id;
end;
$$;

create or replace function public.update_household_member_role(
  p_household_id uuid,
  p_user_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_household_owner(p_household_id) then
    raise exception 'Only the household owner can change roles.'
      using errcode = 'P0001';
  end if;

  if p_role not in ('editor', 'viewer') then
    raise exception 'Role must be editor or viewer.'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.household_members hm
    where hm.household_id = p_household_id
      and hm.user_id = p_user_id
      and hm.role = 'owner'
  ) then
    raise exception 'Cannot change the household owner role.'
      using errcode = 'P0001';
  end if;

  update public.household_members
  set role = p_role
  where household_id = p_household_id
    and user_id = p_user_id;
end;
$$;

create or replace function public.remove_household_member(
  p_household_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_household_owner(p_household_id) then
    raise exception 'Only the household owner can remove members.'
      using errcode = 'P0001';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Transfer ownership before removing yourself.'
      using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.household_members hm
    where hm.household_id = p_household_id
      and hm.user_id = p_user_id
      and hm.role = 'owner'
  ) then
    raise exception 'Cannot remove the household owner.'
      using errcode = 'P0001';
  end if;

  delete from public.household_members
  where household_id = p_household_id
    and user_id = p_user_id;
end;
$$;

create or replace function public.get_household_invite_preview(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'householdName', h.name,
    'role', hi.role,
    'invitedEmail', hi.invited_email,
    'inviterName', coalesce(nullif(trim(inviter.name), ''), 'Household owner'),
    'expiresAt', hi.expires_at,
    'status', hi.status
  )
  into result
  from public.household_invites hi
  inner join public.households h on h.id = hi.household_id
  left join public.profiles inviter on inviter.user_id = hi.invited_by_user_id
  where hi.token = trim(p_token)
    and hi.status = 'pending'
    and hi.expires_at > now();

  return result;
end;
$$;

revoke all on function public.get_my_primary_household() from public;
revoke all on function public.list_household_members(uuid) from public;
revoke all on function public.list_household_invites(uuid) from public;
revoke all on function public.list_my_pending_household_invites() from public;
revoke all on function public.create_household_invite(uuid, text, text) from public;
revoke all on function public.revoke_household_invite(uuid) from public;
revoke all on function public.accept_household_invite(text) from public;
revoke all on function public.decline_household_invite(text) from public;
revoke all on function public.update_household_member_role(uuid, uuid, text) from public;
revoke all on function public.remove_household_member(uuid, uuid) from public;
revoke all on function public.get_household_invite_preview(text) from public;

grant execute on function public.get_my_primary_household() to authenticated, service_role;
grant execute on function public.list_household_members(uuid) to authenticated, service_role;
grant execute on function public.list_household_invites(uuid) to authenticated, service_role;
grant execute on function public.list_my_pending_household_invites() to authenticated, service_role;
grant execute on function public.create_household_invite(uuid, text, text) to authenticated, service_role;
grant execute on function public.revoke_household_invite(uuid) to authenticated, service_role;
grant execute on function public.accept_household_invite(text) to authenticated, service_role;
grant execute on function public.decline_household_invite(text) to authenticated, service_role;
grant execute on function public.update_household_member_role(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.remove_household_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.get_household_invite_preview(text) to anon, authenticated, service_role;

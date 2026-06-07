-- Referral Infrastructure V1
-- Goal: Invite other pet owners and track invitations, signups, conversions.
-- Rewards architecture only: 1 successful referral => 1 month premium (NOT issued automatically).

-- ---------------------------------------------------------------------------
-- Referral codes (one per user)

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null,
  created_at timestamptz not null default now(),
  constraint referral_codes_user_id_key unique (user_id),
  constraint referral_codes_code_key unique (code)
);

create index if not exists referral_codes_code_idx on public.referral_codes (code);

alter table public.referral_codes enable row level security;

create policy "Users can read own referral code"
  on public.referral_codes
  for select
  using (auth.uid() = user_id);

-- No direct insert policy (created via service role / edge function)

-- ---------------------------------------------------------------------------
-- Referrals (invitation -> signup -> conversion)

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_user_id uuid not null references auth.users (id) on delete cascade,
  referral_code text not null references public.referral_codes (code) on delete restrict,
  invitee_email text,
  invitee_user_id uuid references auth.users (id) on delete set null,
  referral_source text,
  status text not null default 'invited'
    check (status in ('invited', 'signed_up', 'converted')),
  invited_at timestamptz not null default now(),
  signed_up_at timestamptz,
  converted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists referrals_inviter_user_id_idx on public.referrals (inviter_user_id);
create index if not exists referrals_invitee_user_id_idx on public.referrals (invitee_user_id);
create index if not exists referrals_referral_code_idx on public.referrals (referral_code);

-- Dedup invites per inviter + email (case-insensitive) when email is present
create unique index if not exists referrals_inviter_invitee_email_unique
  on public.referrals (inviter_user_id, lower(invitee_email))
  where invitee_email is not null;

alter table public.referrals enable row level security;

create policy "Users can read own referrals"
  on public.referrals
  for select
  using (auth.uid() = inviter_user_id);

-- No public insert; invitations are written via service role / edge function.

-- ---------------------------------------------------------------------------
-- Reward architecture (NOT issued automatically)

create or replace view public.referral_reward_status as
select
  inviter_user_id as user_id,
  count(*) filter (where status = 'invited') as invitations,
  count(*) filter (where status in ('signed_up', 'converted')) as signups,
  count(*) filter (where status = 'converted') as conversions,
  count(*) filter (where status = 'converted') as eligible_premium_months
from public.referrals
group by inviter_user_id;

-- ---------------------------------------------------------------------------
-- Trigger function: extend handle_new_user to also wire referrals + founding
-- NOTE: This replaces the existing function to keep a single source of truth.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_founding boolean;
  referred_code text;
  inviter_id uuid;
begin
  -- Founding Member
  select exists (
    select 1 from public.founding_member_signups f
    where lower(f.email) = lower(coalesce(new.email, ''))
  ) into is_founding;

  -- Referral tracking (signup attribution)
  -- accept either snake_case (referral_code) or camelCase (referralCode)
  referred_code := nullif(coalesce(new.raw_user_meta_data ->> 'referral_code', ''), '');
  if referred_code is null then
    referred_code := nullif(coalesce(new.raw_user_meta_data ->> 'referralCode', ''), '');
  end if;
  if referred_code is not null then
    select user_id into inviter_id
    from public.referral_codes
    where code = referred_code;
  end if;

  insert into public.profiles (
    user_id,
    email,
    name,
    onboarding_completed,
    subscription_tier,
    founding_member
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    false,
    'free',
    coalesce(is_founding, false)
  )
  on conflict (user_id) do nothing;

  -- Link founding signup record to this user (if present)
  update public.founding_member_signups
  set user_id = new.id
  where user_id is null
    and lower(email) = lower(coalesce(new.email, ''));

  -- Record referral signup (if attribution exists)
  if inviter_id is not null then
    -- Prefer updating an existing invitation for this email
    update public.referrals
    set invitee_user_id = new.id,
        signed_up_at = now(),
        status = case when status = 'converted' then 'converted' else 'signed_up' end
    where referral_code = referred_code
      and invitee_user_id is null
      and invitee_email is not null
      and lower(invitee_email) = lower(coalesce(new.email, ''));

    if not found then
      insert into public.referrals (
        inviter_user_id,
        referral_code,
        invitee_email,
        invitee_user_id,
        referral_source,
        status,
        invited_at,
        signed_up_at
      )
      values (
        inviter_id,
        referred_code,
        coalesce(new.email, ''),
        new.id,
        'signup',
        'signed_up',
        now(),
        now()
      );
    end if;
  end if;

  return new;
end;
$$;


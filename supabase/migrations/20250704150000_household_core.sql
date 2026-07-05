-- Household core: shared pets, role-based access, household-scoped RLS
-- Backfills every existing user into a single-member household (owner role).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_tier text not null default 'free'
    check (plan_tier in ('free', 'plus', 'pro', 'enterprise')),
  billing_owner_user_id uuid not null references auth.users (id) on delete restrict,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists households_billing_owner_user_id_idx
  on public.households (billing_owner_user_id);

create unique index if not exists households_stripe_customer_id_key
  on public.households (stripe_customer_id)
  where stripe_customer_id is not null;

create table if not exists public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index if not exists household_members_user_id_idx
  on public.household_members (user_id);

create table if not exists public.pet_household_access (
  pet_id uuid not null references public.pets (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  primary key (pet_id, household_id)
);

create index if not exists pet_household_access_household_id_idx
  on public.pet_household_access (household_id);

-- Pets belong to a household; owner_id retained for quota triggers and legacy paths.
alter table public.pets
  add column if not exists household_id uuid references public.households (id) on delete restrict;

create index if not exists pets_household_id_idx on public.pets (household_id);

-- ---------------------------------------------------------------------------
-- RLS helper functions (stable, security definer — avoids policy recursion)
-- ---------------------------------------------------------------------------

create or replace function public.household_member_roles()
returns text[]
language sql
immutable
as $$
  select array['owner', 'editor', 'viewer']::text[];
$$;

create or replace function public.household_editor_roles()
returns text[]
language sql
immutable
as $$
  select array['owner', 'editor']::text[];
$$;

create or replace function public.is_household_member(
  p_household_id uuid,
  p_roles text[] default public.household_member_roles()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = p_household_id
      and hm.user_id = auth.uid()
      and hm.role = any (p_roles)
  );
$$;

create or replace function public.can_read_pet(p_pet_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pet_household_access pha
    inner join public.household_members hm
      on hm.household_id = pha.household_id
    where pha.pet_id = p_pet_id
      and hm.user_id = auth.uid()
      and hm.role = any (public.household_member_roles())
  );
$$;

create or replace function public.can_write_pet(p_pet_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pet_household_access pha
    inner join public.household_members hm
      on hm.household_id = pha.household_id
    where pha.pet_id = p_pet_id
      and hm.user_id = auth.uid()
      and hm.role = any (public.household_editor_roles())
  );
$$;

create or replace function public.is_household_owner(p_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = p_household_id
      and hm.user_id = auth.uid()
      and hm.role = 'owner'
  );
$$;

-- Keep pet_household_access in sync when pets are created.
create or replace function public.sync_pet_household_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.pet_household_access (pet_id, household_id)
  values (new.id, new.household_id)
  on conflict (pet_id, household_id) do nothing;
  return new;
end;
$$;

drop trigger if exists pets_sync_household_access on public.pets;

create trigger pets_sync_household_access
  after insert on public.pets
  for each row
  execute function public.sync_pet_household_access();

-- Default owner_id from household billing owner when omitted on insert.
create or replace function public.set_pet_owner_from_household()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.household_id is not null then
    select h.billing_owner_user_id
    into new.owner_id
    from public.households h
    where h.id = new.household_id;

    if new.owner_id is null then
      raise exception 'Household not found for pet insert.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists pets_set_owner_from_household on public.pets;

create trigger pets_set_owner_from_household
  before insert on public.pets
  for each row
  execute function public.set_pet_owner_from_household();

create or replace function public.set_households_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists households_set_updated_at on public.households;

create trigger households_set_updated_at
  before update on public.households
  for each row
  execute function public.set_households_updated_at();

-- ---------------------------------------------------------------------------
-- Backfill: one implicit household per existing profile / pet owner
-- ---------------------------------------------------------------------------

insert into public.households (name, plan_tier, billing_owner_user_id)
select
  coalesce(nullif(trim(p.name), ''), 'My') || ' Household',
  case
    when coalesce(lower(p.subscription_status), 'inactive') in ('active', 'trialing')
      and coalesce(lower(p.subscription_plan), 'free') in ('plus', 'pro', 'enterprise')
      then lower(p.subscription_plan)
    when coalesce(lower(p.subscription_tier), 'free') = 'family' then 'enterprise'
    when coalesce(lower(p.subscription_tier), 'free') = 'premium'
      and coalesce(lower(p.subscription_status), 'inactive') <> 'inactive' then 'pro'
    else 'free'
  end,
  p.user_id
from public.profiles p
where not exists (
  select 1
  from public.households h
  where h.billing_owner_user_id = p.user_id
);

insert into public.households (name, plan_tier, billing_owner_user_id)
select
  'My Household',
  'free',
  distinct_owners.owner_id
from (
  select distinct pets.owner_id
  from public.pets
) as distinct_owners
where not exists (
  select 1
  from public.households h
  where h.billing_owner_user_id = distinct_owners.owner_id
);

insert into public.household_members (household_id, user_id, role, joined_at)
select h.id, h.billing_owner_user_id, 'owner', coalesce(p.created_at, now())
from public.households h
left join public.profiles p on p.user_id = h.billing_owner_user_id
on conflict (household_id, user_id) do nothing;

update public.pets pet
set household_id = h.id
from public.households h
where h.billing_owner_user_id = pet.owner_id
  and pet.household_id is null;

insert into public.pet_household_access (pet_id, household_id)
select pet.id, pet.household_id
from public.pets pet
where pet.household_id is not null
on conflict (pet_id, household_id) do nothing;

alter table public.pets
  alter column household_id set not null;

-- ---------------------------------------------------------------------------
-- RLS: households + members
-- ---------------------------------------------------------------------------

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.pet_household_access enable row level security;

drop policy if exists "Household members can read household" on public.households;
drop policy if exists "Billing owner can update household" on public.households;

create policy "Household members can read household"
  on public.households
  for select
  using (public.is_household_member(id));

create policy "Billing owner can update household"
  on public.households
  for update
  using (billing_owner_user_id = auth.uid())
  with check (billing_owner_user_id = auth.uid());

drop policy if exists "Members can read household roster" on public.household_members;
drop policy if exists "Owners can manage household roster" on public.household_members;

create policy "Members can read household roster"
  on public.household_members
  for select
  using (public.is_household_member(household_id));

create policy "Owners can manage household roster"
  on public.household_members
  for all
  using (public.is_household_owner(household_id))
  with check (public.is_household_owner(household_id));

drop policy if exists "Members can read pet household access" on public.pet_household_access;

create policy "Members can read pet household access"
  on public.pet_household_access
  for select
  using (public.is_household_member(household_id));

-- ---------------------------------------------------------------------------
-- RLS: pets (replace owner_id-only policies)
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read own pets" on public.pets;
drop policy if exists "Users can insert own pets" on public.pets;
drop policy if exists "Users can update own pets" on public.pets;
drop policy if exists "Users can delete own pets" on public.pets;

create policy "Household members can read pets"
  on public.pets
  for select
  using (public.can_read_pet(id));

create policy "Household editors can insert pets"
  on public.pets
  for insert
  with check (
    public.is_household_member(household_id, public.household_editor_roles())
  );

create policy "Household editors can update pets"
  on public.pets
  for update
  using (public.can_write_pet(id))
  with check (public.can_write_pet(id));

create policy "Household editors can delete pets"
  on public.pets
  for delete
  using (public.can_write_pet(id));

-- ---------------------------------------------------------------------------
-- RLS: health_records
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read health records for own pets" on public.health_records;
drop policy if exists "Users can insert health records for own pets" on public.health_records;
drop policy if exists "Users can update health records for own pets" on public.health_records;
drop policy if exists "Users can delete health records for own pets" on public.health_records;

create policy "Household members can read health records"
  on public.health_records
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert health records"
  on public.health_records
  for insert
  with check (public.can_write_pet(pet_id));

create policy "Household editors can update health records"
  on public.health_records
  for update
  using (public.can_write_pet(pet_id))
  with check (public.can_write_pet(pet_id));

create policy "Household editors can delete health records"
  on public.health_records
  for delete
  using (public.can_write_pet(pet_id));

-- ---------------------------------------------------------------------------
-- RLS: pet_documents
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read documents for own pets" on public.pet_documents;
drop policy if exists "Users can insert documents for own pets" on public.pet_documents;
drop policy if exists "Users can delete documents for own pets" on public.pet_documents;

create policy "Household members can read pet documents"
  on public.pet_documents
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert pet documents"
  on public.pet_documents
  for insert
  with check (public.can_write_pet(pet_id));

create policy "Household editors can delete pet documents"
  on public.pet_documents
  for delete
  using (public.can_write_pet(pet_id));

-- ---------------------------------------------------------------------------
-- RLS: reminders
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read reminders for own pets" on public.reminders;
drop policy if exists "Users can insert reminders for own pets" on public.reminders;
drop policy if exists "Users can update reminders for own pets" on public.reminders;
drop policy if exists "Users can delete reminders for own pets" on public.reminders;

create policy "Household members can read reminders"
  on public.reminders
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert reminders"
  on public.reminders
  for insert
  with check (public.can_write_pet(pet_id));

create policy "Household editors can update reminders"
  on public.reminders
  for update
  using (public.can_write_pet(pet_id))
  with check (public.can_write_pet(pet_id));

create policy "Household editors can delete reminders"
  on public.reminders
  for delete
  using (public.can_write_pet(pet_id));

-- ---------------------------------------------------------------------------
-- RLS: daily_check_ins
-- ---------------------------------------------------------------------------

drop policy if exists "Users can read check-ins for own pets" on public.daily_check_ins;
drop policy if exists "Users can insert check-ins for own pets" on public.daily_check_ins;
drop policy if exists "Users can update check-ins for own pets" on public.daily_check_ins;
drop policy if exists "Users can delete check-ins for own pets" on public.daily_check_ins;

create policy "Household members can read daily check-ins"
  on public.daily_check_ins
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert daily check-ins"
  on public.daily_check_ins
  for insert
  with check (public.can_write_pet(pet_id));

create policy "Household editors can update daily check-ins"
  on public.daily_check_ins
  for update
  using (public.can_write_pet(pet_id))
  with check (public.can_write_pet(pet_id));

create policy "Household editors can delete daily check-ins"
  on public.daily_check_ins
  for delete
  using (public.can_write_pet(pet_id));

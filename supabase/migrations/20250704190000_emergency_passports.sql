-- Token-gated public emergency passport (critical fields only).

create table if not exists public.emergency_passports (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  public_token text not null,
  critical_fields_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint emergency_passports_pet_id_key unique (pet_id),
  constraint emergency_passports_public_token_key unique (public_token)
);

create index if not exists emergency_passports_pet_id_idx
  on public.emergency_passports (pet_id);

alter table public.emergency_passports enable row level security;

drop trigger if exists emergency_passports_set_updated_at on public.emergency_passports;

create trigger emergency_passports_set_updated_at
  before update on public.emergency_passports
  for each row
  execute function public.set_households_updated_at();

drop policy if exists "Household members can read emergency passports" on public.emergency_passports;
drop policy if exists "Household editors can insert emergency passports" on public.emergency_passports;
drop policy if exists "Household editors can update emergency passports" on public.emergency_passports;

create policy "Household members can read emergency passports"
  on public.emergency_passports
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert emergency passports"
  on public.emergency_passports
  for insert
  with check (public.can_write_pet(pet_id));

create policy "Household editors can update emergency passports"
  on public.emergency_passports
  for update
  using (public.can_write_pet(pet_id))
  with check (public.can_write_pet(pet_id));

-- Public read by token (no auth) — returns only safe critical fields.
create or replace function public.get_emergency_passport_public(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  result jsonb;
begin
  if p_token is null or length(trim(p_token)) < 8 then
    return null;
  end if;

  select jsonb_build_object(
    'petName', p.name,
    'species', p.species,
    'breed', coalesce(p.breed, ''),
    'photoUrl', p.photo_url,
    'criticalFields', ep.critical_fields_json,
    'updatedAt', ep.updated_at
  )
  into result
  from public.emergency_passports ep
  inner join public.pets p on p.id = ep.pet_id
  where ep.public_token = trim(p_token)
    and ep.revoked_at is null;

  return result;
end;
$$;

revoke all on function public.get_emergency_passport_public(text) from public;
grant execute on function public.get_emergency_passport_public(text) to anon, authenticated, service_role;

-- Household role lookup for client-side editor gating.
create or replace function public.get_my_household_role_for_pet(p_pet_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select hm.role
  from public.pets p
  inner join public.household_members hm
    on hm.household_id = p.household_id
  where p.id = p_pet_id
    and hm.user_id = auth.uid()
  limit 1;
$$;

revoke all on function public.get_my_household_role_for_pet(uuid) from public;
grant execute on function public.get_my_household_role_for_pet(uuid) to authenticated, service_role;

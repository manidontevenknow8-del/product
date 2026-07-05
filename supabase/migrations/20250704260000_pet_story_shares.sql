-- Token-gated public pet life-story share (read-only narrative + milestones).

create table if not exists public.pet_story_shares (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  public_token text not null,
  story_snapshot_json jsonb not null default '{}'::jsonb,
  shared_with_full_history boolean not null default false,
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint pet_story_shares_pet_id_key unique (pet_id),
  constraint pet_story_shares_public_token_key unique (public_token)
);

create index if not exists pet_story_shares_pet_id_idx
  on public.pet_story_shares (pet_id);

alter table public.pet_story_shares enable row level security;

drop trigger if exists pet_story_shares_set_updated_at on public.pet_story_shares;

create trigger pet_story_shares_set_updated_at
  before update on public.pet_story_shares
  for each row
  execute function public.set_households_updated_at();

drop policy if exists "Household members can read pet story shares" on public.pet_story_shares;
drop policy if exists "Household editors can insert pet story shares" on public.pet_story_shares;
drop policy if exists "Household editors can update pet story shares" on public.pet_story_shares;

create policy "Household members can read pet story shares"
  on public.pet_story_shares
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert pet story shares"
  on public.pet_story_shares
  for insert
  with check (public.can_write_pet(pet_id));

create policy "Household editors can update pet story shares"
  on public.pet_story_shares
  for update
  using (public.can_write_pet(pet_id))
  with check (public.can_write_pet(pet_id));

create or replace function public.get_pet_story_public(p_token text)
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
    'updatedAt', ps.updated_at,
    'sharedWithFullHistory', ps.shared_with_full_history,
    'snapshot', ps.story_snapshot_json
  )
  into result
  from public.pet_story_shares ps
  inner join public.pets p on p.id = ps.pet_id
  where ps.public_token = trim(p_token)
    and ps.revoked_at is null;

  return result;
end;
$$;

revoke all on function public.get_pet_story_public(text) from public;
grant execute on function public.get_pet_story_public(text) to anon, authenticated, service_role;

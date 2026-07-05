-- Manual pet moments for the life-story timeline (household-scoped).

create table if not exists public.pet_moments (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  household_id uuid not null references public.households (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  caption text not null,
  photo_url text,
  occurred_at timestamptz not null,
  type text not null default 'manual' check (type = 'manual'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pet_moments_caption_not_blank check (char_length(trim(caption)) > 0)
);

create index if not exists pet_moments_pet_occurred_idx
  on public.pet_moments (pet_id, occurred_at desc);

create index if not exists pet_moments_household_id_idx
  on public.pet_moments (household_id);

alter table public.pet_moments enable row level security;

drop policy if exists "Household members can read pet moments" on public.pet_moments;
drop policy if exists "Household editors can insert pet moments" on public.pet_moments;
drop policy if exists "Household editors can update pet moments" on public.pet_moments;
drop policy if exists "Household editors can delete pet moments" on public.pet_moments;

create policy "Household members can read pet moments"
  on public.pet_moments
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert pet moments"
  on public.pet_moments
  for insert
  with check (public.can_write_pet(pet_id));

create policy "Household editors can update pet moments"
  on public.pet_moments
  for update
  using (public.can_write_pet(pet_id))
  with check (public.can_write_pet(pet_id));

create policy "Household editors can delete pet moments"
  on public.pet_moments
  for delete
  using (public.can_write_pet(pet_id));

create or replace function public.set_pet_moment_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pet_household uuid;
begin
  select household_id into pet_household from public.pets where id = new.pet_id;
  if pet_household is null then
    raise exception 'Pet must belong to a household';
  end if;
  new.household_id := pet_household;
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists pet_moments_set_defaults on public.pet_moments;

create trigger pet_moments_set_defaults
  before insert or update on public.pet_moments
  for each row
  execute function public.set_pet_moment_defaults();

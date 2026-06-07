-- PetClues: user-owned pets table
-- Run via Supabase CLI: supabase db push

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species text not null check (species in ('dog', 'cat', 'other')),
  breed text,
  birth_date date,
  weight text,
  gender text check (gender is null or gender in ('male', 'female', 'unknown')),
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pets_owner_id_idx on public.pets (owner_id);

alter table public.pets enable row level security;

create policy "Users can read own pets"
  on public.pets
  for select
  using (auth.uid() = owner_id);

create policy "Users can insert own pets"
  on public.pets
  for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own pets"
  on public.pets
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete own pets"
  on public.pets
  for delete
  using (auth.uid() = owner_id);

create or replace function public.set_pets_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pets_set_updated_at on public.pets;

create trigger pets_set_updated_at
  before update on public.pets
  for each row
  execute function public.set_pets_updated_at();

-- PetClues: pet-linked health records
-- Run via Supabase CLI: supabase db push

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  source_document_id uuid references public.pet_documents (id) on delete set null,
  record_type text not null check (
    record_type in (
      'vaccination',
      'allergy',
      'medication',
      'diagnosis',
      'surgery',
      'weight',
      'wellness'
    )
  ),
  title text not null,
  description text,
  date_recorded date not null,
  next_due_date date,
  severity text check (severity is null or severity in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists health_records_pet_id_idx on public.health_records (pet_id);
create index if not exists health_records_record_type_idx on public.health_records (record_type);
create index if not exists health_records_date_recorded_idx on public.health_records (date_recorded desc);

alter table public.health_records enable row level security;

create policy "Users can read health records for own pets"
  on public.health_records
  for select
  using (
    exists (
      select 1
      from public.pets
      where pets.id = health_records.pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can insert health records for own pets"
  on public.health_records
  for insert
  with check (
    exists (
      select 1
      from public.pets
      where pets.id = pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can update health records for own pets"
  on public.health_records
  for update
  using (
    exists (
      select 1
      from public.pets
      where pets.id = health_records.pet_id
        and pets.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.pets
      where pets.id = pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can delete health records for own pets"
  on public.health_records
  for delete
  using (
    exists (
      select 1
      from public.pets
      where pets.id = health_records.pet_id
        and pets.owner_id = auth.uid()
    )
  );

create or replace function public.set_health_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists health_records_set_updated_at on public.health_records;

create trigger health_records_set_updated_at
  before update on public.health_records
  for each row
  execute function public.set_health_records_updated_at();

-- PetClues: pet-linked reminders
-- Run via Supabase CLI: supabase db push

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  title text not null,
  category text not null check (
    category in (
      'vaccinations',
      'deworming',
      'grooming',
      'vet_visits',
      'medication',
      'food_refill',
      'insurance_renewal',
      'custom'
    )
  ),
  due_date date not null,
  notes text,
  priority text not null check (priority in ('low', 'medium', 'high')),
  recurring text not null default 'none' check (
    recurring in ('none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly')
  ),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reminders_pet_id_idx on public.reminders (pet_id);
create index if not exists reminders_due_date_idx on public.reminders (due_date);

alter table public.reminders enable row level security;

create policy "Users can read reminders for own pets"
  on public.reminders
  for select
  using (
    exists (
      select 1
      from public.pets
      where pets.id = reminders.pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can insert reminders for own pets"
  on public.reminders
  for insert
  with check (
    exists (
      select 1
      from public.pets
      where pets.id = pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can update reminders for own pets"
  on public.reminders
  for update
  using (
    exists (
      select 1
      from public.pets
      where pets.id = reminders.pet_id
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

create policy "Users can delete reminders for own pets"
  on public.reminders
  for delete
  using (
    exists (
      select 1
      from public.pets
      where pets.id = reminders.pet_id
        and pets.owner_id = auth.uid()
    )
  );

create or replace function public.set_reminders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reminders_set_updated_at on public.reminders;

create trigger reminders_set_updated_at
  before update on public.reminders
  for each row
  execute function public.set_reminders_updated_at();

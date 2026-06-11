-- Daily pet check-ins (feeding + walk) for V1 retention loop

create table if not exists public.daily_check_ins (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  check_in_date date not null,
  feeding text not null,
  walk_distance_km numeric(6, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pet_id, check_in_date)
);

create index if not exists daily_check_ins_pet_date_idx
  on public.daily_check_ins (pet_id, check_in_date desc);

alter table public.daily_check_ins enable row level security;

drop policy if exists "Users can read check-ins for own pets" on public.daily_check_ins;
drop policy if exists "Users can insert check-ins for own pets" on public.daily_check_ins;
drop policy if exists "Users can update check-ins for own pets" on public.daily_check_ins;
drop policy if exists "Users can delete check-ins for own pets" on public.daily_check_ins;

create policy "Users can read check-ins for own pets"
  on public.daily_check_ins
  for select
  using (
    exists (
      select 1 from public.pets
      where pets.id = daily_check_ins.pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can insert check-ins for own pets"
  on public.daily_check_ins
  for insert
  with check (
    exists (
      select 1 from public.pets
      where pets.id = pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can update check-ins for own pets"
  on public.daily_check_ins
  for update
  using (
    exists (
      select 1 from public.pets
      where pets.id = daily_check_ins.pet_id
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can delete check-ins for own pets"
  on public.daily_check_ins
  for delete
  using (
    exists (
      select 1 from public.pets
      where pets.id = daily_check_ins.pet_id
        and pets.owner_id = auth.uid()
    )
  );

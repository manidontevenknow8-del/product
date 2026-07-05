-- Structured symptom logging for insights and vet visit exports.

create table if not exists public.pet_symptom_logs (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  symptoms_json jsonb not null default '[]'::jsonb,
  note text,
  photo_url text,
  logged_at timestamptz not null default now(),
  logged_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint pet_symptom_logs_symptoms_array check (jsonb_typeof(symptoms_json) = 'array')
);

create index if not exists pet_symptom_logs_pet_logged_idx
  on public.pet_symptom_logs (pet_id, logged_at desc);

alter table public.pet_symptom_logs enable row level security;

drop policy if exists "Household members can read symptom logs" on public.pet_symptom_logs;
drop policy if exists "Household editors can insert symptom logs" on public.pet_symptom_logs;
drop policy if exists "Household editors can update symptom logs" on public.pet_symptom_logs;
drop policy if exists "Household editors can delete symptom logs" on public.pet_symptom_logs;

create policy "Household members can read symptom logs"
  on public.pet_symptom_logs
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert symptom logs"
  on public.pet_symptom_logs
  for insert
  with check (public.can_write_pet(pet_id));

create policy "Household editors can update symptom logs"
  on public.pet_symptom_logs
  for update
  using (public.can_write_pet(pet_id))
  with check (public.can_write_pet(pet_id));

create policy "Household editors can delete symptom logs"
  on public.pet_symptom_logs
  for delete
  using (public.can_write_pet(pet_id));

create or replace function public.set_pet_symptom_log_logged_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.logged_by_user_id is null then
    new.logged_by_user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists pet_symptom_logs_set_logged_by on public.pet_symptom_logs;

create trigger pet_symptom_logs_set_logged_by
  before insert or update on public.pet_symptom_logs
  for each row
  execute function public.set_pet_symptom_log_logged_by();

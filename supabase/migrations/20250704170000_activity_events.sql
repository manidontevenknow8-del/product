-- Household-scoped activity feed (replaces client localStorage log).

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null check (
    event_type in ('scan', 'reminder', 'note', 'update', 'automation')
  ),
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_pet_created_idx
  on public.activity_events (pet_id, created_at desc);

create index if not exists activity_events_household_created_idx
  on public.activity_events (household_id, created_at desc);

alter table public.activity_events enable row level security;

create or replace function public.set_activity_event_actor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.actor_user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists activity_events_set_actor on public.activity_events;

create trigger activity_events_set_actor
  before insert on public.activity_events
  for each row
  execute function public.set_activity_event_actor();

drop policy if exists "Household members can read activity events" on public.activity_events;
drop policy if exists "Household editors can insert activity events" on public.activity_events;

create policy "Household members can read activity events"
  on public.activity_events
  for select
  using (public.can_read_pet(pet_id));

create policy "Household editors can insert activity events"
  on public.activity_events
  for insert
  with check (
    public.can_write_pet(pet_id)
    and household_id = (
      select p.household_id
      from public.pets p
      where p.id = pet_id
    )
  );

-- Vet visit export usage metering (Plus: 1/month, Pro+: unlimited).
-- PDF is generated client-side; this table enforces quotas server-side.

create table if not exists public.vet_visit_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid not null references public.pets (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists vet_visit_exports_user_id_idx
  on public.vet_visit_exports (user_id);

create index if not exists vet_visit_exports_user_month_idx
  on public.vet_visit_exports (user_id, created_at desc);

alter table public.vet_visit_exports enable row level security;

drop policy if exists "Users read own vet visit exports" on public.vet_visit_exports;
drop policy if exists "Users insert own vet visit exports" on public.vet_visit_exports;

create policy "Users read own vet visit exports"
  on public.vet_visit_exports
  for select
  using (auth.uid() = user_id);

create policy "Users insert own vet visit exports"
  on public.vet_visit_exports
  for insert
  with check (
    auth.uid() = user_id
    and public.can_read_pet(pet_id)
  );

create or replace function public.enforce_vet_visit_export_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan text;
  monthly_limit integer;
  monthly_count integer;
  month_start timestamptz;
begin
  plan := public.resolve_commercial_plan(new.user_id);

  if plan not in ('plus', 'pro', 'enterprise') then
    raise exception 'Vet visit export requires Plus or above.'
      using errcode = 'P0001';
  end if;

  if plan = 'plus' then
    monthly_limit := 1;
    month_start := date_trunc('month', now());
    select count(*) into monthly_count
    from public.vet_visit_exports
    where user_id = new.user_id
      and created_at >= month_start;

    if monthly_count >= monthly_limit then
      raise exception 'Monthly vet visit export limit reached. Upgrade to Pro for unlimited exports.'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_vet_visit_export_limit on public.vet_visit_exports;

create trigger enforce_vet_visit_export_limit
  before insert on public.vet_visit_exports
  for each row
  execute function public.enforce_vet_visit_export_limit();

-- Reserve one export (checks quota atomically via trigger).
create or replace function public.reserve_vet_visit_export(p_pet_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  export_id uuid;
  uid uuid;
begin
  uid := auth.uid();
  if uid is null then
    raise exception 'Authentication required.'
      using errcode = 'P0001';
  end if;

  if not public.can_read_pet(p_pet_id) then
    raise exception 'Not authorized for this pet.'
      using errcode = 'P0001';
  end if;

  insert into public.vet_visit_exports (user_id, pet_id)
  values (uid, p_pet_id)
  returning id into export_id;

  return export_id;
end;
$$;

revoke all on function public.reserve_vet_visit_export(uuid) from public;
grant execute on function public.reserve_vet_visit_export(uuid) to authenticated, service_role;

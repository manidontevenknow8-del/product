-- Server-side quota enforcement: documents, reminders, health records
-- Aligns with src/subscription/planLimits.ts (Free tier caps)

-- ---------------------------------------------------------------------------
-- Shared plan resolver (mirrors edge + client resolveEffectivePlan)
-- ---------------------------------------------------------------------------

create or replace function public.resolve_commercial_plan(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  user_plan text;
  user_status text;
  user_tier text;
begin
  select subscription_plan, subscription_status, subscription_tier
  into user_plan, user_status, user_tier
  from public.profiles
  where user_id = p_user_id;

  user_plan := coalesce(lower(user_plan), 'free');
  user_status := coalesce(lower(user_status), 'inactive');
  user_tier := coalesce(lower(user_tier), 'free');

  if user_status in ('active', 'trialing') then
    if user_plan = 'enterprise' or user_tier = 'family' then
      return 'enterprise';
    end if;
    if user_plan = 'pro' then
      return 'pro';
    end if;
    if user_plan = 'plus' then
      return 'plus';
    end if;
  end if;

  if user_tier = 'family' then
    return 'enterprise';
  end if;

  if user_tier = 'premium' and user_status <> 'inactive' then
    return 'pro';
  end if;

  return 'free';
end;
$$;

-- ---------------------------------------------------------------------------
-- Pet limit (ensure Pro = 10 — idempotent with 20250610400000)
-- ---------------------------------------------------------------------------

create or replace function public.enforce_pet_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  plan text;
  pet_limit integer;
  pet_count integer;
begin
  plan := public.resolve_commercial_plan(new.owner_id);

  pet_limit := case plan
    when 'enterprise' then 100
    when 'pro' then 10
    when 'plus' then 3
    else 1
  end;

  select count(*) into pet_count
  from public.pets
  where owner_id = new.owner_id;

  if pet_count >= pet_limit then
    raise exception 'Pet limit reached (% pets on current plan). Upgrade for more.', pet_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Document vault: Free = 5 total across all pets
-- ---------------------------------------------------------------------------

create or replace function public.enforce_document_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  plan text;
  doc_limit integer;
  doc_count integer;
begin
  select p.owner_id into owner_id
  from public.pets p
  where p.id = new.pet_id;

  if owner_id is null then
    raise exception 'Pet not found for document upload.'
      using errcode = 'P0001';
  end if;

  plan := public.resolve_commercial_plan(owner_id);

  if plan in ('plus', 'pro', 'enterprise') then
    return new;
  end if;

  doc_limit := 5;

  select count(*) into doc_count
  from public.pet_documents pd
  inner join public.pets p on p.id = pd.pet_id
  where p.owner_id = owner_id;

  if doc_count >= doc_limit then
    raise exception 'Document Vault Limit Reached. Upgrade to Plus to unlock unlimited secure medical document storage.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_document_limit on public.pet_documents;

create trigger enforce_document_limit
  before insert on public.pet_documents
  for each row
  execute function public.enforce_document_limit();

-- ---------------------------------------------------------------------------
-- Reminders: Free = 2 active (incomplete) across all pets
-- ---------------------------------------------------------------------------

create or replace function public.enforce_reminder_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  plan text;
  reminder_limit integer;
  active_count integer;
begin
  select p.owner_id into owner_id
  from public.pets p
  where p.id = new.pet_id;

  if owner_id is null then
    raise exception 'Pet not found for reminder.'
      using errcode = 'P0001';
  end if;

  plan := public.resolve_commercial_plan(owner_id);

  if plan in ('plus', 'pro', 'enterprise') then
    return new;
  end if;

  reminder_limit := 2;

  select count(*) into active_count
  from public.reminders r
  inner join public.pets p on p.id = r.pet_id
  where p.owner_id = owner_id
    and r.completed = false;

  if active_count >= reminder_limit then
    raise exception 'Reminder limit reached (% active reminders on Free plan). Upgrade to Plus for unlimited reminders.', reminder_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_reminder_limit on public.reminders;

create trigger enforce_reminder_limit
  before insert on public.reminders
  for each row
  execute function public.enforce_reminder_limit();

-- ---------------------------------------------------------------------------
-- Health records: Free = 3 total across all pets
-- ---------------------------------------------------------------------------

create or replace function public.enforce_health_record_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_id uuid;
  plan text;
  record_limit integer;
  record_count integer;
begin
  select p.owner_id into owner_id
  from public.pets p
  where p.id = new.pet_id;

  if owner_id is null then
    raise exception 'Pet not found for health record.'
      using errcode = 'P0001';
  end if;

  plan := public.resolve_commercial_plan(owner_id);

  if plan in ('plus', 'pro', 'enterprise') then
    return new;
  end if;

  record_limit := 3;

  select count(*) into record_count
  from public.health_records hr
  inner join public.pets p on p.id = hr.pet_id
  where p.owner_id = owner_id;

  if record_count >= record_limit then
    raise exception 'Health record limit reached (% records on Free plan). Upgrade to Plus for unlimited records.', record_limit
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_health_record_limit on public.health_records;

create trigger enforce_health_record_limit
  before insert on public.health_records
  for each row
  execute function public.enforce_health_record_limit();

-- ---------------------------------------------------------------------------
-- Vet bill extractions: allow owner inserts (quota enforced in edge function)
-- ---------------------------------------------------------------------------

drop policy if exists "Paid plans insert vet bill extractions" on public.vet_bill_extractions;

create policy "Users insert own vet bill extractions"
  on public.vet_bill_extractions
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.pets
      where pets.id = pet_id
        and pets.owner_id = auth.uid()
    )
  );

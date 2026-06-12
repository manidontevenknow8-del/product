-- Pre-launch security hardening: concurrency, dedup, rate limits, RLS fixes

-- ---------------------------------------------------------------------------
-- Rate limiting (edge functions via service role RPC)
-- ---------------------------------------------------------------------------

create table if not exists public.rate_limit_windows (
  limit_key text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  primary key (limit_key, window_start)
);

create index if not exists rate_limit_windows_window_idx
  on public.rate_limit_windows (window_start);

alter table public.rate_limit_windows enable row level security;

-- No client policies - service role only

create or replace function public.check_rate_limit(
  p_key text,
  p_max_requests integer default 5,
  p_window_minutes integer default 30
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  if p_key is null or length(p_key) = 0 then
    return false;
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / (p_window_minutes * 60)) * (p_window_minutes * 60)
  );

  insert into public.rate_limit_windows (limit_key, window_start, request_count)
  values (p_key, v_window_start, 1)
  on conflict (limit_key, window_start)
  do update set request_count = rate_limit_windows.request_count + 1
  returning request_count into v_count;

  return v_count <= p_max_requests;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- Concurrency: vet bill extractions - one row per document
-- ---------------------------------------------------------------------------

create unique index if not exists vet_bill_extractions_document_id_unique
  on public.vet_bill_extractions (document_id);

-- ---------------------------------------------------------------------------
-- Concurrency: referrals - one conversion row per invitee user
-- ---------------------------------------------------------------------------

create unique index if not exists referrals_invitee_user_id_unique
  on public.referrals (invitee_user_id)
  where invitee_user_id is not null;

-- ---------------------------------------------------------------------------
-- Concurrency: email dedup when user_id is null (founding emails)
-- ---------------------------------------------------------------------------

create unique index if not exists email_send_log_anon_dedup_unique
  on public.email_send_log (email_type, dedup_key)
  where user_id is null;

-- ---------------------------------------------------------------------------
-- Concurrency: free pet limit - lock profile row during insert
-- ---------------------------------------------------------------------------

create or replace function public.enforce_free_pet_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tier text;
  pet_count integer;
begin
  select subscription_tier into tier
  from public.profiles
  where user_id = new.owner_id
  for update;

  if coalesce(tier, 'free') in ('premium', 'family') then
    return new;
  end if;

  select count(*) into pet_count
  from public.pets
  where owner_id = new.owner_id;

  if pet_count >= 1 then
    raise exception 'Free plan allows 1 pet. Upgrade to Premium for unlimited pets.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: founding signups - edge function only (service role), no public insert
-- ---------------------------------------------------------------------------

drop policy if exists "Public can submit founding signup" on public.founding_member_signups;

-- ---------------------------------------------------------------------------
-- RLS: vet bill extractions - premium + pet ownership on insert/update
-- ---------------------------------------------------------------------------

drop policy if exists "Premium users insert vet bill extractions" on public.vet_bill_extractions;
drop policy if exists "Users can update own vet bill extractions" on public.vet_bill_extractions;

create policy "Premium users insert vet bill extractions"
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
    and exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.subscription_tier in ('premium', 'family')
    )
  );

create policy "Users can update own vet bill extractions"
  on public.vet_bill_extractions
  for update
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.pets
      where pets.id = vet_bill_extractions.pet_id
        and pets.owner_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.pets
      where pets.id = pet_id
        and pets.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: validate pet_id segment belongs to authenticated owner
-- ---------------------------------------------------------------------------

drop policy if exists "Users can upload own pet document files" on storage.objects;
drop policy if exists "Users can read own pet document files" on storage.objects;
drop policy if exists "Users can delete own pet document files" on storage.objects;

create policy "Users can read own pet document files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
    and exists (
      select 1 from public.pets
      where pets.id::text = (storage.foldername(storage.objects.name))[2]
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can upload own pet document files"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'pet-documents'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
    and exists (
      select 1 from public.pets
      where pets.id::text = (storage.foldername(storage.objects.name))[2]
        and pets.owner_id = auth.uid()
    )
  );

create policy "Users can delete own pet document files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'pet-documents'
    and (storage.foldername(storage.objects.name))[1] = auth.uid()::text
    and exists (
      select 1 from public.pets
      where pets.id::text = (storage.foldername(storage.objects.name))[2]
        and pets.owner_id = auth.uid()
    )
  );

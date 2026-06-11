-- Tiered plan entitlements: free / plus / pro / enterprise pet limits

-- ---------------------------------------------------------------------------
-- Replace binary free/premium pet limit with tier-aware enforcement
-- ---------------------------------------------------------------------------

create or replace function public.enforce_pet_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_plan text;
  user_status text;
  user_tier text;
  pet_limit integer;
  pet_count integer;
begin
  select subscription_plan, subscription_status, subscription_tier
  into user_plan, user_status, user_tier
  from public.profiles
  where user_id = new.owner_id
  for update;

  user_plan := coalesce(lower(user_plan), 'free');
  user_status := coalesce(lower(user_status), 'inactive');
  user_tier := coalesce(lower(user_tier), 'free');

  if user_status in ('active', 'trialing') then
    if user_plan = 'enterprise' or user_tier = 'family' then
      pet_limit := 100;
    elsif user_plan = 'pro' or user_tier = 'premium' then
      pet_limit := 10;
    elsif user_plan = 'plus' then
      pet_limit := 3;
    else
      pet_limit := 1;
    end if;
  elsif user_tier = 'family' then
    pet_limit := 100;
  elsif user_tier = 'premium' then
    pet_limit := 10;
  else
    pet_limit := 1;
  end if;

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

drop trigger if exists enforce_free_pet_limit on public.pets;
drop trigger if exists enforce_pet_limit on public.pets;

create trigger enforce_pet_limit
  before insert on public.pets
  for each row
  execute function public.enforce_pet_limit();

-- ---------------------------------------------------------------------------
-- Vet bill decoder: Plus and above (active or trialing)
-- ---------------------------------------------------------------------------

drop policy if exists "Premium users insert vet bill extractions" on public.vet_bill_extractions;

create policy "Paid plans insert vet bill extractions"
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
        and (
          p.subscription_status in ('active', 'trialing')
          and lower(coalesce(p.subscription_plan, 'free')) in ('plus', 'pro', 'enterprise')
          or p.subscription_tier in ('premium', 'family')
        )
    )
  );

-- ---------------------------------------------------------------------------
-- Sync profile helper: map Razorpay plan to tier
-- ---------------------------------------------------------------------------

create or replace function public.sync_profile_subscription_tier(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sub_status text;
  sub_plan text;
begin
  select status, plan into sub_status, sub_plan
  from public.subscriptions
  where user_id = p_user_id
    and status = 'active'
    and (expires_at is null or expires_at > now())
  order by started_at desc nulls last
  limit 1;

  if sub_status = 'active' then
    update public.profiles
    set
      subscription_plan = coalesce(sub_plan, 'pro'),
      subscription_status = 'active',
      subscription_tier = case
        when lower(coalesce(sub_plan, 'pro')) = 'enterprise' then 'family'
        when lower(coalesce(sub_plan, 'pro')) in ('plus', 'pro') then 'premium'
        else 'free'
      end
    where user_id = p_user_id;
  else
    update public.profiles
    set
      subscription_tier = 'free',
      subscription_plan = 'free',
      subscription_status = 'inactive'
    where user_id = p_user_id
      and subscription_tier not in ('family');
  end if;
end;
$$;

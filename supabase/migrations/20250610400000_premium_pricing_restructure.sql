-- Premium pricing restructure: Pro pet limit 10, billing interval support

-- ---------------------------------------------------------------------------
-- Pro pet limit: 7 → 10 (no self-service above 10)
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

-- ---------------------------------------------------------------------------
-- Billing interval on subscriptions (monthly | yearly)
-- ---------------------------------------------------------------------------

alter table public.subscriptions
  add column if not exists billing_interval text not null default 'monthly';

alter table public.subscriptions
  drop constraint if exists subscriptions_billing_interval_check;

alter table public.subscriptions
  add constraint subscriptions_billing_interval_check
  check (billing_interval in ('monthly', 'yearly'));

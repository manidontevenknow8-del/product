-- Premium subscriptions: Stripe customers, subscription state, webhook idempotency

create table if not exists public.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text not null,
  created_at timestamptz not null default now(),
  constraint stripe_customers_user_id_key unique (user_id),
  constraint stripe_customers_stripe_customer_id_key unique (stripe_customer_id)
);

create index if not exists stripe_customers_user_id_idx on public.stripe_customers (user_id);

alter table public.stripe_customers enable row level security;

create policy "Users read own stripe customer"
  on public.stripe_customers
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_subscription_id text not null,
  stripe_customer_id text not null,
  status text not null default 'inactive'
    check (status in (
      'active', 'trialing', 'past_due', 'canceled', 'unpaid',
      'incomplete', 'incomplete_expired', 'paused'
    )),
  plan text not null default 'premium'
    check (plan in ('premium')),
  interval text not null default 'monthly'
    check (interval in ('monthly', 'yearly')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_user_id_key unique (user_id),
  constraint subscriptions_stripe_subscription_id_key unique (stripe_subscription_id)
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id);

alter table public.subscriptions enable row level security;

create policy "Users read own subscription"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------

create table if not exists public.stripe_webhook_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;

-- No user policies — service role only

-- ---------------------------------------------------------------------------

create or replace function public.set_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_subscriptions_updated_at();

-- Denormalized tier on profiles (updated by Stripe webhook via service role)
create or replace function public.sync_profile_subscription_tier(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sub_status text;
  next_tier text;
begin
  select status into sub_status
  from public.subscriptions
  where user_id = p_user_id;

  if sub_status in ('active', 'trialing') then
    next_tier := 'premium';
  else
    next_tier := 'free';
  end if;

  update public.profiles
  set subscription_tier = next_tier
  where user_id = p_user_id;
end;
$$;

-- Free tier: max 1 pet
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
  where user_id = new.owner_id;

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

drop trigger if exists pets_enforce_free_limit on public.pets;

create trigger pets_enforce_free_limit
  before insert on public.pets
  for each row
  execute function public.enforce_free_pet_limit();

-- Vet Bill Decoder: premium-only inserts
drop policy if exists "Users can insert own vet bill extractions" on public.vet_bill_extractions;

create policy "Premium users insert vet bill extractions"
  on public.vet_bill_extractions
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and p.subscription_tier in ('premium', 'family')
    )
  );

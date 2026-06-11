-- Razorpay V1: replace Stripe subscription schema with Razorpay orders/payments

-- ---------------------------------------------------------------------------
-- Profiles: subscription_plan + subscription_status (source of truth for gates)
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists subscription_plan text not null default 'free',
  add column if not exists subscription_status text not null default 'inactive';

-- ---------------------------------------------------------------------------
-- Remove Stripe tables
-- ---------------------------------------------------------------------------

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
drop table if exists public.stripe_webhook_events;
drop table if exists public.stripe_customers;
drop table if exists public.subscriptions;

-- ---------------------------------------------------------------------------
-- Razorpay subscriptions
-- ---------------------------------------------------------------------------

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan text not null,
  status text not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);
create unique index if not exists subscriptions_razorpay_payment_id_key
  on public.subscriptions (razorpay_payment_id)
  where razorpay_payment_id is not null;

alter table public.subscriptions enable row level security;

drop policy if exists "Users read own subscription" on public.subscriptions;

create policy "Users read own subscription"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Webhook audit log (idempotency)
-- ---------------------------------------------------------------------------

create table if not exists public.webhook_events (
  id text primary key,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

alter table public.webhook_events enable row level security;

-- Service role only — no user policies

-- ---------------------------------------------------------------------------
-- Triggers & profile sync
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
      subscription_tier = 'premium',
      subscription_plan = coalesce(sub_plan, 'pro'),
      subscription_status = 'active'
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

-- Free tier: max 1 pet (unchanged — uses subscription_tier)
-- Vet bill RLS: allow active Razorpay subscribers
drop policy if exists "Premium users insert vet bill extractions" on public.vet_bill_extractions;

create policy "Premium users insert vet bill extractions"
  on public.vet_bill_extractions
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.profiles p
      where p.user_id = auth.uid()
        and (
          p.subscription_status = 'active'
          or p.subscription_tier in ('premium', 'family')
        )
    )
  );

-- Annual membership pricing: currency, amount paid, billing cycle

alter table public.subscriptions
  add column if not exists currency text,
  add column if not exists amount_paid integer,
  add column if not exists billing_cycle text not null default 'annual';

alter table public.subscriptions
  drop constraint if exists subscriptions_billing_cycle_check;

alter table public.subscriptions
  add constraint subscriptions_billing_cycle_check
  check (billing_cycle in ('annual'));

alter table public.subscriptions
  drop constraint if exists subscriptions_currency_check;

alter table public.subscriptions
  add constraint subscriptions_currency_check
  check (currency is null or currency in ('INR', 'USD'));

update public.subscriptions
set billing_cycle = 'annual'
where billing_cycle is distinct from 'annual';

update public.subscriptions
set billing_interval = 'yearly'
where billing_interval = 'monthly';

comment on column public.subscriptions.billing_cycle is 'PetClues memberships are annual only';
comment on column public.subscriptions.amount_paid is 'Amount charged in minor units (paise or cents)';
comment on column public.subscriptions.currency is 'INR for India, USD for international';

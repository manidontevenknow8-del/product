-- Genesis Vault one-time purchases (guest checkout via /genesis)

create table if not exists public.genesis_vault_purchases (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text not null unique,
  razorpay_payment_id text not null unique,
  email text,
  currency text not null check (currency in ('INR', 'USD')),
  amount_minor integer,
  product text not null default 'genesis_vault',
  created_at timestamptz not null default now()
);

create index if not exists genesis_vault_purchases_created_at_idx
  on public.genesis_vault_purchases (created_at desc);

alter table public.genesis_vault_purchases enable row level security;

-- No public read/write; edge functions use service role.

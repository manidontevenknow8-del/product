-- Promo codes: redeemable Pro trials (e.g. 1 month free)

alter table public.profiles
  add column if not exists promo_trial_ends_at timestamptz;

-- ---------------------------------------------------------------------------
-- Promo codes
-- ---------------------------------------------------------------------------

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text,
  plan text not null default 'pro' check (plan in ('plus', 'pro')),
  trial_days int not null default 30 check (trial_days > 0 and trial_days <= 365),
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null,
  max_redemptions int,
  redemption_count int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint promo_codes_code_key unique (code),
  constraint promo_codes_redemption_count_nonneg check (redemption_count >= 0)
);

create index if not exists promo_codes_code_idx on public.promo_codes (code);
create index if not exists promo_codes_valid_until_idx on public.promo_codes (valid_until);

alter table public.promo_codes enable row level security;

-- No public read — redemption goes through security definer RPC only.

create table if not exists public.promo_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_code_id uuid not null references public.promo_codes (id) on delete restrict,
  user_id uuid not null references auth.users (id) on delete cascade,
  trial_ends_at timestamptz not null,
  redeemed_at timestamptz not null default now(),
  constraint promo_code_redemptions_user_code_key unique (promo_code_id, user_id)
);

create index if not exists promo_code_redemptions_user_id_idx
  on public.promo_code_redemptions (user_id);

alter table public.promo_code_redemptions enable row level security;

create policy "Users read own promo redemptions"
  on public.promo_code_redemptions
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Seed: 1-month Pro trial promo (valid 6 months from launch)
-- Code: 6QDZ-LC4A
-- ---------------------------------------------------------------------------

insert into public.promo_codes (
  code,
  description,
  plan,
  trial_days,
  valid_from,
  valid_until,
  max_redemptions,
  active
)
values (
  '6QDZ-LC4A',
  '1 month free Pro trial — marketing promo',
  'pro',
  30,
  timestamptz '2026-06-08 00:00:00+00',
  timestamptz '2026-12-08 23:59:59+00',
  null,
  true
)
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- Expire founding + promo trials (skip users with paid active subs)
-- ---------------------------------------------------------------------------

create or replace function public.expire_founding_trials()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
  set
    subscription_tier = 'free',
    subscription_status = 'inactive',
    subscription_plan = 'free'
  where p.subscription_status = 'trialing'
    and not exists (
      select 1
      from public.subscriptions s
      where s.user_id = p.user_id
        and s.status = 'active'
        and s.razorpay_payment_id is not null
    )
    and (
      (p.founding_member = true and p.founding_trial_ends_at is not null and p.founding_trial_ends_at < now())
      or (p.promo_trial_ends_at is not null and p.promo_trial_ends_at < now())
    );

  update public.subscriptions s
  set status = 'expired', updated_at = now()
  from public.profiles p
  where s.user_id = p.user_id
    and s.status = 'trialing'
    and not exists (
      select 1
      from public.subscriptions paid
      where paid.user_id = p.user_id
        and paid.status = 'active'
        and paid.razorpay_payment_id is not null
    )
    and (
      (p.founding_member = true and p.founding_trial_ends_at is not null and p.founding_trial_ends_at < now())
      or (p.promo_trial_ends_at is not null and p.promo_trial_ends_at < now())
    );
end;
$$;

-- ---------------------------------------------------------------------------
-- Redeem promo code (authenticated users)
-- ---------------------------------------------------------------------------

create or replace function public.redeem_promo_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_promo public.promo_codes%rowtype;
  v_trial_end timestamptz;
  v_normalized_code text;
begin
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Sign in to redeem a promo code');
  end if;

  v_normalized_code := upper(trim(p_code));

  if v_normalized_code = '' then
    return jsonb_build_object('success', false, 'error', 'Enter a promo code');
  end if;

  select *
  into v_promo
  from public.promo_codes
  where upper(code) = v_normalized_code
    and active = true
    and valid_from <= now()
    and valid_until >= now()
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired promo code');
  end if;

  if v_promo.max_redemptions is not null and v_promo.redemption_count >= v_promo.max_redemptions then
    return jsonb_build_object('success', false, 'error', 'This promo code has reached its redemption limit');
  end if;

  if exists (
    select 1
    from public.promo_code_redemptions
    where promo_code_id = v_promo.id
      and user_id = v_user_id
  ) then
    return jsonb_build_object('success', false, 'error', 'You have already used this promo code');
  end if;

  if exists (
    select 1
    from public.profiles
    where user_id = v_user_id
      and subscription_status in ('active', 'trialing')
      and subscription_plan in ('plus', 'pro')
  ) then
    return jsonb_build_object(
      'success',
      false,
      'error',
      'You already have an active subscription or trial'
    );
  end if;

  if exists (
    select 1
    from public.subscriptions
    where user_id = v_user_id
      and status = 'active'
      and razorpay_payment_id is not null
  ) then
    return jsonb_build_object('success', false, 'error', 'You already have a paid subscription');
  end if;

  v_trial_end := now() + make_interval(days => v_promo.trial_days);

  update public.profiles
  set
    subscription_tier = 'premium',
    subscription_plan = v_promo.plan,
    subscription_status = 'trialing',
    promo_trial_ends_at = v_trial_end
  where user_id = v_user_id;

  insert into public.subscriptions (user_id, plan, status, started_at, expires_at)
  values (v_user_id, v_promo.plan, 'trialing', now(), v_trial_end);

  insert into public.promo_code_redemptions (promo_code_id, user_id, trial_ends_at)
  values (v_promo.id, v_user_id, v_trial_end);

  update public.promo_codes
  set redemption_count = redemption_count + 1
  where id = v_promo.id;

  perform public.sync_profile_subscription_tier(v_user_id);

  return jsonb_build_object(
    'success', true,
    'plan', v_promo.plan,
    'trialDays', v_promo.trial_days,
    'trialEndsAt', v_trial_end
  );
end;
$$;

revoke all on function public.redeem_promo_code(text) from public;
grant execute on function public.redeem_promo_code(text) to authenticated;

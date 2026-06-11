-- Founding member benefits: premium trial, lifetime discount, feature voting

alter table public.profiles
  add column if not exists founding_trial_ends_at timestamptz,
  add column if not exists founding_lifetime_discount boolean not null default false;

-- ---------------------------------------------------------------------------
-- Feature voting (founding members only)
-- ---------------------------------------------------------------------------

create table if not exists public.founding_feature_candidates (
  id text primary key,
  title text not null,
  description text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists public.founding_feature_votes (
  user_id uuid not null references auth.users (id) on delete cascade,
  feature_id text not null references public.founding_feature_candidates (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, feature_id)
);

insert into public.founding_feature_candidates (id, title, description, sort_order)
values
  ('vet-decoder-plus', 'Vet Bill Decoder+', 'Deeper AI analysis of invoices, labs, and prescriptions.', 1),
  ('checkin-streaks', 'Check-in streak insights', 'Longer trends for feeding and walk patterns across pets.', 2),
  ('richer-reports', 'Richer monthly reports', 'More chapters, custom branding, and print-ready layouts.', 3),
  ('ai-companion', 'AI care companion', 'Guided conversations tailored to your pet''s routine.', 4),
  ('family-sharing', 'Family & caretaker sharing', 'Invite partners and sitters with scoped access.', 5)
on conflict (id) do nothing;

alter table public.founding_feature_candidates enable row level security;
alter table public.founding_feature_votes enable row level security;

drop policy if exists "Anyone can read feature candidates" on public.founding_feature_candidates;
drop policy if exists "Founding members read own votes" on public.founding_feature_votes;
drop policy if exists "Founding members cast votes" on public.founding_feature_votes;
drop policy if exists "Founding members update own votes" on public.founding_feature_votes;
drop policy if exists "Founding members delete own votes" on public.founding_feature_votes;

create policy "Anyone can read feature candidates"
  on public.founding_feature_candidates
  for select
  using (active = true);

create policy "Founding members read own votes"
  on public.founding_feature_votes
  for select
  using (auth.uid() = user_id);

create policy "Founding members cast votes"
  on public.founding_feature_votes
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.founding_member = true
    )
  );

create policy "Founding members update own votes"
  on public.founding_feature_votes
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Founding members delete own votes"
  on public.founding_feature_votes
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Expire founding premium trials past end date (unless paid active)
-- ---------------------------------------------------------------------------

create or replace function public.expire_founding_trials()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    subscription_tier = 'free',
    subscription_status = 'inactive',
    subscription_plan = 'free'
  where founding_member = true
    and subscription_status = 'trialing'
    and founding_trial_ends_at is not null
    and founding_trial_ends_at < now();

  update public.subscriptions s
  set status = 'expired', updated_at = now()
  from public.profiles p
  where s.user_id = p.user_id
    and s.status = 'trialing'
    and p.founding_member = true
    and p.founding_trial_ends_at is not null
    and p.founding_trial_ends_at < now();
end;
$$;

-- ---------------------------------------------------------------------------
-- Grant founding benefits on account creation
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_founding boolean;
  referred_code text;
  inviter_id uuid;
  trial_end timestamptz;
begin
  select exists (
    select 1 from public.founding_member_signups f
    where lower(f.email) = lower(coalesce(new.email, ''))
  ) into is_founding;

  referred_code := nullif(coalesce(new.raw_user_meta_data ->> 'referral_code', ''), '');
  if referred_code is null then
    referred_code := nullif(coalesce(new.raw_user_meta_data ->> 'referralCode', ''), '');
  end if;
  if referred_code is not null then
    select user_id into inviter_id
    from public.referral_codes
    where code = referred_code;
  end if;

  if is_founding then
    trial_end := now() + interval '30 days';
  end if;

  insert into public.profiles (
    user_id,
    email,
    name,
    onboarding_completed,
    subscription_tier,
    subscription_plan,
    subscription_status,
    founding_member,
    founding_trial_ends_at,
    founding_lifetime_discount
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    false,
    case when is_founding then 'premium' else 'free' end,
    case when is_founding then 'pro' else 'free' end,
    case when is_founding then 'trialing' else 'inactive' end,
    coalesce(is_founding, false),
    trial_end,
    coalesce(is_founding, false)
  )
  on conflict (user_id) do nothing;

  if is_founding then
    insert into public.subscriptions (user_id, plan, status, started_at, expires_at)
    values (new.id, 'pro', 'trialing', now(), trial_end);
  end if;

  update public.founding_member_signups
  set user_id = new.id
  where user_id is null
    and lower(email) = lower(coalesce(new.email, ''));

  if inviter_id is not null then
    update public.referrals
    set invitee_user_id = new.id,
        signed_up_at = now(),
        status = case when status = 'converted' then 'converted' else 'signed_up' end
    where referral_code = referred_code
      and invitee_user_id is null
      and invitee_email is not null
      and lower(invitee_email) = lower(coalesce(new.email, ''));

    if not found then
      insert into public.referrals (
        inviter_user_id,
        referral_code,
        invitee_email,
        invitee_user_id,
        referral_source,
        status,
        invited_at,
        signed_up_at
      )
      values (
        inviter_id,
        referred_code,
        coalesce(new.email, ''),
        new.id,
        'signup',
        'signed_up',
        now(),
        now()
      );
    end if;
  end if;

  return new;
end;
$$;

-- Backfill perks for existing founding members who signed up before this migration
update public.profiles
set
  subscription_tier = 'premium',
  subscription_status = 'trialing',
  subscription_plan = 'pro',
  founding_lifetime_discount = true,
  founding_trial_ends_at = coalesce(founding_trial_ends_at, now() + interval '30 days')
where founding_member = true
  and subscription_status in ('inactive', 'trialing')
  and subscription_tier = 'free';

insert into public.subscriptions (user_id, plan, status, started_at, expires_at)
select
  p.user_id,
  'pro',
  'trialing',
  now(),
  coalesce(p.founding_trial_ends_at, now() + interval '30 days')
from public.profiles p
where p.founding_member = true
  and p.subscription_status = 'trialing'
  and not exists (
    select 1 from public.subscriptions s
    where s.user_id = p.user_id and s.status in ('trialing', 'active')
  );

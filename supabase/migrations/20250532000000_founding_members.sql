-- Founding Pet Parents Program

alter table public.profiles
  add column if not exists founding_member boolean not null default false;

create table if not exists public.founding_member_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  referral_source text,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Dedup signups by email (case-insensitive)
create unique index if not exists founding_member_signups_email_unique
  on public.founding_member_signups (lower(email));

alter table public.founding_member_signups enable row level security;

-- Public insert allowed (acquisition landing); no select/update/delete policies.
create policy "Public can submit founding signup"
  on public.founding_member_signups
  for insert
  with check (true);

-- When a user signs up with an email that joined the program, mark them as founding.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_founding boolean;
begin
  select exists (
    select 1 from public.founding_member_signups f
    where lower(f.email) = lower(coalesce(new.email, ''))
  ) into is_founding;

  insert into public.profiles (
    user_id,
    email,
    name,
    onboarding_completed,
    subscription_tier,
    founding_member
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    false,
    'free',
    coalesce(is_founding, false)
  )
  on conflict (user_id) do nothing;

  -- Link any existing signup record to this user
  update public.founding_member_signups
  set user_id = new.id
  where user_id is null
    and lower(email) = lower(coalesce(new.email, ''));

  return new;
end;
$$;


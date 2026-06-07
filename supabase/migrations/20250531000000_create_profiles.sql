-- PetClues foundation: user profiles linked to Supabase Auth
-- Run via Supabase CLI: supabase db push

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text,
  email text not null,
  avatar_url text,
  onboarding_completed boolean not null default false,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'premium', 'family')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_user_id_key unique (user_id)
);

create index if not exists profiles_user_id_idx on public.profiles (user_id);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

-- Keep updated_at current on profile changes
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

-- Auto-create profile when a new auth user registers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    user_id,
    email,
    name,
    onboarding_completed,
    subscription_tier
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    false,
    'free'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

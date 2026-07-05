-- Household RLS security tests (no pgTAP dependency)
-- Run: ./scripts/run-household-rls-tests.sh

begin;

-- ---------------------------------------------------------------------------
-- Fixtures
-- ---------------------------------------------------------------------------

do $setup$
declare
  user_a uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  user_b uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  user_viewer uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  household_a uuid := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  household_b uuid := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
  pet_a uuid := '11111111-1111-1111-1111-111111111111';
  pet_b uuid := '22222222-2222-2222-2222-222222222222';
  record_a uuid := '33333333-3333-3333-3333-333333333333';
  document_a uuid := '44444444-4444-4444-4444-444444444444';
  reminder_a uuid := '55555555-5555-5555-5555-555555555555';
  checkin_a uuid := '66666666-6666-6666-6666-666666666666';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values
    (
      '00000000-0000-0000-0000-000000000000',
      user_a,
      'authenticated',
      'authenticated',
      'rls-a@test.petclues.local',
      '$2a$10$abcdefghijklmnopqrstuv/abcdefghijklmnopqrstuv',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      user_b,
      'authenticated',
      'authenticated',
      'rls-b@test.petclues.local',
      '$2a$10$abcdefghijklmnopqrstuv/abcdefghijklmnopqrstuv',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      user_viewer,
      'authenticated',
      'authenticated',
      'rls-viewer@test.petclues.local',
      '$2a$10$abcdefghijklmnopqrstuv/abcdefghijklmnopqrstuv',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    )
  on conflict (id) do nothing;

  insert into public.profiles (user_id, email, name, subscription_tier, subscription_plan, subscription_status)
  values
    (user_a, 'rls-a@test.petclues.local', 'RLS User A', 'free', 'free', 'inactive'),
    (user_b, 'rls-b@test.petclues.local', 'RLS User B', 'free', 'free', 'inactive'),
    (user_viewer, 'rls-viewer@test.petclues.local', 'RLS Viewer', 'free', 'free', 'inactive')
  on conflict (user_id) do nothing;

  insert into public.households (id, name, plan_tier, billing_owner_user_id)
  values
    (household_a, 'Household A', 'free', user_a),
    (household_b, 'Household B', 'free', user_b);

  insert into public.household_members (household_id, user_id, role)
  values
    (household_a, user_a, 'owner'),
    (household_a, user_viewer, 'viewer'),
    (household_b, user_b, 'owner');

  insert into public.pets (id, owner_id, household_id, name, species)
  values
    (pet_a, user_a, household_a, 'Pet A', 'dog'),
    (pet_b, user_b, household_b, 'Pet B', 'cat');

  insert into public.pet_household_access (pet_id, household_id)
  values
    (pet_a, household_a),
    (pet_b, household_b);

  insert into public.health_records (id, pet_id, record_type, title, date_recorded)
  values (record_a, pet_a, 'wellness', 'RLS test record', current_date);

  insert into public.pet_documents (id, pet_id, file_name, file_type, storage_path)
  values (document_a, pet_a, 'test.pdf', 'application/pdf', 'test/rls/test.pdf');

  insert into public.reminders (id, pet_id, title, category, due_date, priority)
  values (reminder_a, pet_a, 'RLS test reminder', 'custom', current_date + 7, 'low');

  insert into public.daily_check_ins (id, pet_id, check_in_date, feeding)
  values (checkin_a, pet_a, current_date, 'normal');
end;
$setup$;

create or replace function pg_temp.impersonate(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text,
    true
  );
  perform set_config('request.jwt.claim.sub', p_user_id::text, true);
end;
$$;

create or replace function pg_temp.assert_eq(p_label text, p_actual bigint, p_expected bigint)
returns void
language plpgsql
as $$
begin
  if p_actual is distinct from p_expected then
    raise exception '[FAIL] %: expected %, got %', p_label, p_expected, p_actual;
  end if;
  raise notice '[PASS] %', p_label;
end;
$$;

create or replace function pg_temp.assert_insert_blocked(p_label text, p_sql text)
returns void
language plpgsql
as $$
begin
  execute p_sql;
  raise exception '[FAIL] %: expected RLS insert block', p_label;
exception
  when insufficient_privilege then
    raise notice '[PASS] %', p_label;
  when others then
    if sqlstate = '42501' then
      raise notice '[PASS] %', p_label;
    else
      raise exception '[FAIL] %: unexpected error % (%)', p_label, sqlerrm, sqlstate;
    end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Test 1: Cross-household isolation (user B vs household A)
-- ---------------------------------------------------------------------------

select pg_temp.impersonate('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

select pg_temp.assert_eq(
  '1a household B cannot read household A pet',
  (select count(*) from public.pets where id = '11111111-1111-1111-1111-111111111111'),
  0
);

select pg_temp.assert_eq(
  '1b household B cannot read household A health record',
  (select count(*) from public.health_records where id = '33333333-3333-3333-3333-333333333333'),
  0
);

select pg_temp.assert_eq(
  '1c household B cannot read household A document',
  (select count(*) from public.pet_documents where id = '44444444-4444-4444-4444-444444444444'),
  0
);

select pg_temp.assert_eq(
  '1d household B cannot read household A reminder',
  (select count(*) from public.reminders where id = '55555555-5555-5555-5555-555555555555'),
  0
);

select pg_temp.assert_eq(
  '1e household B cannot read household A check-in',
  (select count(*) from public.daily_check_ins where id = '66666666-6666-6666-6666-666666666666'),
  0
);

select pg_temp.assert_insert_blocked(
  '1f household B cannot insert household A health record',
  $sql$
    insert into public.health_records (pet_id, record_type, title, date_recorded)
    values ('11111111-1111-1111-1111-111111111111', 'wellness', 'blocked', current_date)
  $sql$
);

select pg_temp.assert_eq(
  '1g household B cannot update household A reminder',
  (
    with updated as (
      update public.reminders
      set title = 'blocked'
      where id = '55555555-5555-5555-5555-555555555555'
      returning id
    )
    select count(*) from updated
  ),
  0
);

select pg_temp.assert_eq(
  '1h household B cannot delete household A document',
  (
    with deleted as (
      delete from public.pet_documents
      where id = '44444444-4444-4444-4444-444444444444'
      returning id
    )
    select count(*) from deleted
  ),
  0
);

-- ---------------------------------------------------------------------------
-- Test 2: Viewer read-only
-- ---------------------------------------------------------------------------

select pg_temp.impersonate('cccccccc-cccc-cccc-cccc-cccccccccccc');

select pg_temp.assert_eq(
  '2a viewer can read household A pet',
  (select count(*) from public.pets where id = '11111111-1111-1111-1111-111111111111'),
  1
);

select pg_temp.assert_eq(
  '2b viewer can read household A health records',
  (select count(*) from public.health_records where pet_id = '11111111-1111-1111-1111-111111111111'),
  1
);

select pg_temp.assert_eq(
  '2c viewer cannot update pet',
  (
    with updated as (
      update public.pets
      set name = 'viewer blocked'
      where id = '11111111-1111-1111-1111-111111111111'
      returning id
    )
    select count(*) from updated
  ),
  0
);

select pg_temp.assert_insert_blocked(
  '2d viewer cannot insert check-in',
  $sql$
    insert into public.daily_check_ins (pet_id, check_in_date, feeding)
    values ('11111111-1111-1111-1111-111111111111', current_date - 1, 'blocked')
  $sql$
);

select pg_temp.assert_eq(
  '2e viewer cannot delete reminder',
  (
    with deleted as (
      delete from public.reminders
      where id = '55555555-5555-5555-5555-555555555555'
      returning id
    )
    select count(*) from deleted
  ),
  0
);

-- ---------------------------------------------------------------------------
-- Test 3: Legacy solo owner retains read/write
-- ---------------------------------------------------------------------------

select pg_temp.impersonate('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

select pg_temp.assert_eq(
  '3a solo owner can read own household pets',
  (select count(*) from public.pets where household_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  1
);

do $owner_write$
declare
  updated_count integer;
begin
  update public.pets
  set name = 'Owner updated'
  where id = '11111111-1111-1111-1111-111111111111';

  get diagnostics updated_count = row_count;
  if updated_count <> 1 then
    raise exception '[FAIL] 3b owner can update pet: expected 1 row, got %', updated_count;
  end if;
  raise notice '[PASS] 3b owner can update pet';

  insert into public.health_records (pet_id, record_type, title, date_recorded)
  values ('11111111-1111-1111-1111-111111111111', 'wellness', 'owner insert', current_date);
  raise notice '[PASS] 3c owner can insert health record';

  update public.daily_check_ins
  set feeding = 'owner edit'
  where id = '66666666-6666-6666-6666-666666666666';

  get diagnostics updated_count = row_count;
  if updated_count <> 1 then
    raise exception '[FAIL] 3d owner can update check-in: expected 1 row, got %', updated_count;
  end if;
  raise notice '[PASS] 3d owner can update check-in';

  if (select name from public.pets where id = '11111111-1111-1111-1111-111111111111') <> 'Owner updated' then
    raise exception '[FAIL] 3e owner update persisted';
  end if;
  raise notice '[PASS] 3e owner update persisted';
end;
$owner_write$;

do $summary$
begin
  raise notice '----------------------------------------';
  raise notice 'All 18 household RLS assertions passed.';
  raise notice '----------------------------------------';
end;
$summary$;

rollback;

#!/usr/bin/env node
/**
 * Creates (or resets) a stable test account for Razorpay website verification.
 * Usage: node scripts/create-razorpay-test-user.mjs
 *
 * Requires .env.local with VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
 * Uses Supabase CLI for service_role (same as smoke-welcome-email.mjs).
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const TEST_EMAIL = 'razorpay-review@petclues.com';
const TEST_PASSWORD = 'PetClues_RzpReview2026!';
const TEST_NAME = 'Razorpay Reviewer';

function loadEnvLocal() {
  const path = join(root, '.env.local');
  const vars = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    vars[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return vars;
}

function getServiceRoleKey(projectRef) {
  const raw = execSync(`npx supabase projects api-keys --project-ref ${projectRef} -o json`, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const keys = JSON.parse(raw);
  const service = keys.find((k) => k.name === 'service_role');
  if (!service?.api_key) throw new Error('service_role key not found via Supabase CLI');
  return service.api_key;
}

async function findUserByEmail(admin, email) {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(`listUsers failed: ${error.message}`);
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function main() {
  const env = loadEnvLocal();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  }

  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const serviceRoleKey = getServiceRoleKey(projectRef);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anon = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('=== Razorpay review test account ===\n');

  let userId;
  const existing = await findUserByEmail(admin, TEST_EMAIL);

  if (existing) {
    console.log('1. Updating existing user…');
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { name: TEST_NAME },
    });
    if (error) throw new Error(`updateUser failed: ${error.message}`);
  } else {
    console.log('1. Creating new user…');
    const { data, error } = await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { name: TEST_NAME },
    });
    if (error || !data.user) {
      throw new Error(`createUser failed: ${error?.message ?? 'no user'}`);
    }
    userId = data.user.id;
  }

  console.log(`   user_id: ${userId}`);

  console.log('2. Ensuring profile (onboarding complete)…');
  const { error: profileError } = await admin.from('profiles').upsert(
    {
      user_id: userId,
      email: TEST_EMAIL,
      name: TEST_NAME,
      onboarding_completed: true,
      subscription_tier: 'free',
    },
    { onConflict: 'user_id' },
  );
  if (profileError) throw new Error(`profile upsert failed: ${profileError.message}`);

  console.log('3. Verifying sign-in…');
  const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (signInError || !signIn.session) {
    throw new Error(`signIn failed: ${signInError?.message ?? 'no session'}`);
  }
  console.log('   sign-in OK');

  console.log('\n--- Paste into Razorpay verification form ---\n');
  console.log(`Website:     https://petclues.com/`);
  console.log(`Login URL:   https://petclues.com/login`);
  console.log(`Pricing:     https://petclues.com/pricing`);
  console.log(`Email:       ${TEST_EMAIL}`);
  console.log(`Password:    ${TEST_PASSWORD}`);
  console.log('\nRequires login: Yes');
  console.log('Account is email-confirmed and skips onboarding.');
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});

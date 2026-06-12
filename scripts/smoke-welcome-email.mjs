#!/usr/bin/env node
/**
 * Smoke test: queue-welcome-email edge function → Resend → email_send_log
 * Usage: node scripts/smoke-welcome-email.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

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
  const raw = execSync(
    `npx supabase projects api-keys --project-ref ${projectRef} -o json`,
    { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
  );
  const keys = JSON.parse(raw);
  const service = keys.find((k) => k.name === 'service_role');
  if (!service?.api_key) throw new Error('service_role key not found via Supabase CLI');
  return service.api_key;
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 3)}***@${domain}`;
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

  const testEmail = `welcome-smoke+${Date.now()}@petclues-smoke.test`;
  const testPassword = `SmokeTest!${Date.now().toString(36)}`;
  const testName = 'Welcome Smoke Test';

  console.log('=== PetClues welcome email smoke test ===\n');
  console.log(`1. Creating confirmed test user: ${maskEmail(testEmail)}`);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { name: testName },
  });

  if (createError || !created.user) {
    throw new Error(`createUser failed: ${createError?.message ?? 'no user'}`);
  }

  const userId = created.user.id;
  console.log(`   user_id: ${userId}`);

  console.log('2. Signing in to obtain session JWT');
  const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError || !signIn.session) {
    throw new Error(`signIn failed: ${signInError?.message ?? 'no session'}`);
  }

  const accessToken = signIn.session.access_token;

  console.log('3. Invoking queue-welcome-email edge function');
  const { data: invokeData, error: invokeError } = await anon.functions.invoke(
    'queue-welcome-email',
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (invokeError) {
    console.error('   invoke error:', invokeError.message);
    if (invokeError.context) {
      try {
        const body = await invokeError.context.json?.();
        console.error('   response body:', body);
      } catch {
        /* ignore */
      }
    }
    throw new Error(`queue-welcome-email invoke failed: ${invokeError.message}`);
  }

  console.log('   response:', JSON.stringify(invokeData));

  console.log('4. Checking email_send_log');
  const { data: logRow, error: logError } = await admin
    .from('email_send_log')
    .select('id, email_type, dedup_key, recipient_email, resend_id, sent_at')
    .eq('user_id', userId)
    .eq('email_type', 'welcome')
    .eq('dedup_key', 'welcome:v1')
    .maybeSingle();

  if (logError) {
    throw new Error(`email_send_log query failed: ${logError.message}`);
  }

  if (!logRow) {
    throw new Error(
      invokeData?.status === 'skipped'
        ? 'Dedup skipped send but no log row - unexpected'
        : 'No welcome row in email_send_log - email likely NOT sent',
    );
  }

  console.log('   log row:', {
    email_type: logRow.email_type,
    dedup_key: logRow.dedup_key,
    recipient: maskEmail(logRow.recipient_email),
    resend_id: logRow.resend_id ?? '(missing)',
    sent_at: logRow.sent_at,
  });

  console.log('\n5. Verifying dedup (second invoke should skip)');
  const { data: secondInvoke } = await anon.functions.invoke('queue-welcome-email', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log('   second response:', JSON.stringify(secondInvoke));

  if (secondInvoke?.status !== 'skipped') {
    console.warn('   WARN: expected status "skipped" on second invoke');
  }

  console.log('\n6. Cleaning up test user');
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.warn(`   cleanup warning: ${deleteError.message}`);
  } else {
    console.log('   test user deleted');
  }

  const passed =
    invokeData?.success === true &&
    (invokeData?.status === 'sent' || invokeData?.status === 'skipped') &&
    logRow.resend_id;

  if (!logRow.resend_id) {
    console.error('\nFAIL: email_send_log has no resend_id - Resend may have rejected the send.');
    process.exit(1);
  }

  if (invokeData?.status !== 'sent') {
    console.error(`\nFAIL: first invoke status was "${invokeData?.status}", expected "sent".`);
    process.exit(1);
  }

  console.log('\nPASS: Welcome email smoke test succeeded.');
  console.log('   Resend accepted the message (resend_id present).');
  console.log('   Check the Resend dashboard for delivery status to the test inbox if needed.');
  process.exit(0);
}

main().catch((err) => {
  console.error('\nFAIL:', err.message);
  process.exit(1);
});

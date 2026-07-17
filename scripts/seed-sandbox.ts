/**
 * seed-sandbox.ts
 *
 * Creates 30 fully populated "Genesis Vault" demo accounts for high-ticket sales prospects.
 *
 * Prerequisites:
 *   1. Supabase Dashboard → Settings → API
 *      - Project URL  → SUPABASE_URL (or VITE_SUPABASE_URL)
 *      - service_role key → SUPABASE_SERVICE_ROLE_KEY  (NOT the anon key)
 *   2. Add those values to `.env.local` or `.env` in the project root (source-code/).
 *
 * Run:
 *   cd source-code
 *   npx tsx scripts/seed-sandbox.ts
 *
 * Optional:
 *   npx tsx scripts/seed-sandbox.ts --from 1 --to 5   # seed only test1..test5
 *   npx tsx scripts/seed-sandbox.ts --dry-run          # print plan, no writes
 *
 * Credentials handed to prospects:
 *   Email:    test1@gmail.com … test30@gmail.com
 *   Password: Petclues@0209
 */

import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const SANDBOX_PASSWORD = 'Petclues@0209';
const DOCUMENT_BUCKET = 'pet-documents';
const DUMMY_PDF_URL =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

// ── Env loading (tsx does not auto-load Vite env files) ───────────────────────

function loadEnvFile(filename: string): void {
  const path = join(PROJECT_ROOT, filename);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      'Missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY.',
    );
    console.error('Add them to .env.local in the source-code/ directory.');
    process.exit(1);
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── CLI ───────────────────────────────────────────────────────────────────────

function parseArgs(): { from: number; to: number; dryRun: boolean } {
  const args = process.argv.slice(2);
  let from = 1;
  let to = 30;
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) from = Number(args[++i]);
    else if (args[i] === '--to' && args[i + 1]) to = Number(args[++i]);
    else if (args[i] === '--dry-run') dryRun = true;
  }

  if (!Number.isFinite(from) || !Number.isFinite(to) || from < 1 || to < from || to > 30) {
    console.error('Invalid range. Use --from 1 --to 30 (max 30 accounts).');
    process.exit(1);
  }

  return { from, to, dryRun };
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function isoTimestampDaysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, 30, 0, 0);
  return d.toISOString();
}

function addMonthsIsoDate(isoDate: string, months: number): string {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

// ── Demo content ──────────────────────────────────────────────────────────────

type PetPersona = {
  name: string;
  species: string;
  breed: string;
  gender: string;
  birthDate: string;
  weight: string;
  coatColor: string;
  diet: string;
  microchipId: string;
  conditionsNotes: string;
  photoUrl: string;
  ownerName: string;
  householdName: string;
};

const PET_PERSONAS: PetPersona[] = [
  {
    name: 'Winston',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    birthDate: '2020-04-12',
    weight: '32 kg',
    coatColor: 'Cream',
    diet: 'Human-grade salmon & sweet potato',
    microchipId: '985112004321001',
    conditionsNotes: 'Elite travel companion. Cleared for EU corridor relocations.',
    photoUrl: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=1200&q=85',
    ownerName: 'Alexandra Mercer',
    householdName: 'Mercer Genesis Vault',
  },
  {
    name: 'Hugo',
    species: 'dog',
    breed: 'French Bulldog',
    gender: 'male',
    birthDate: '2021-09-03',
    weight: '12 kg',
    coatColor: 'Brindle',
    diet: 'Prescription low-grain kibble + probiotics',
    microchipId: '985112004321002',
    conditionsNotes: 'Brachycephalic travel protocol on file. Prefers cabin-class routing.',
    photoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=85',
    ownerName: 'Julian Ashford',
    householdName: 'Ashford Relocation Studio',
  },
  {
    name: 'Clementine',
    species: 'cat',
    breed: 'Bengal',
    gender: 'female',
    birthDate: '2019-11-18',
    weight: '5.2 kg',
    coatColor: 'Rosetted gold',
    diet: 'Freeze-dried raw + filtered water fountain',
    microchipId: '985112004321003',
    conditionsNotes: 'Indoor-only passport. Anxiety-sensitive during quarantine windows.',
    photoUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1200&q=85',
    ownerName: 'Elena Voss',
    householdName: 'Voss Feline Vault',
  },
  {
    name: 'Archer',
    species: 'dog',
    breed: 'Standard Poodle',
    gender: 'male',
    birthDate: '2018-06-22',
    weight: '26 kg',
    coatColor: 'Apricot',
    diet: 'Rotational novel-protein diet',
    microchipId: '985112004321004',
    conditionsNotes: 'Hypoallergenic coat maintenance schedule documented.',
    photoUrl: 'https://images.unsplash.com/photo-1616190066994-4cec0bfc0c8e?w=1200&q=85',
    ownerName: 'Marcus Chen',
    householdName: 'Chen Executive Vault',
  },
  {
    name: 'Miso',
    species: 'dog',
    breed: 'Shiba Inu',
    gender: 'female',
    birthDate: '2022-01-14',
    weight: '9 kg',
    coatColor: 'Red sesame',
    diet: 'Japanese-imported kibble + bone broth',
    microchipId: '985112004321005',
    conditionsNotes: 'Tokyo ↔ London corridor history. Titer certificates current.',
    photoUrl: 'https://images.unsplash.com/photo-1543465077-db45d21b88a1?w=1200&q=85',
    ownerName: 'Sienna Nakamura',
    householdName: 'Nakamura Pacific Vault',
  },
  {
    name: 'Beau',
    species: 'dog',
    breed: 'Labrador Retriever',
    gender: 'male',
    birthDate: '2019-03-08',
    weight: '34 kg',
    coatColor: 'Chocolate',
    diet: 'Performance athlete blend',
    microchipId: '985112004321006',
    conditionsNotes: 'Service-animal documentation archived in Vault.',
    photoUrl: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=1200&q=85',
    ownerName: 'Olivia Hartwell',
    householdName: 'Hartwell Genesis Vault',
  },
  {
    name: 'Luna',
    species: 'cat',
    breed: 'Ragdoll',
    gender: 'female',
    birthDate: '2020-12-01',
    weight: '4.8 kg',
    coatColor: 'Seal bicolor',
    diet: 'Wet food rotation — rabbit & duck',
    microchipId: '985112004321007',
    conditionsNotes: 'Luxury carrier acclimation complete. Dubai corridor ready.',
    photoUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&q=85',
    ownerName: 'Isabella Romero',
    householdName: 'Romero Feline Vault',
  },
  {
    name: 'Theodore',
    species: 'dog',
    breed: 'Cavalier King Charles Spaniel',
    gender: 'male',
    birthDate: '2021-05-27',
    weight: '8.5 kg',
    coatColor: 'Blenheim',
    diet: 'Cardiac-support veterinary formula',
    microchipId: '985112004321008',
    conditionsNotes: 'Cardiology clearance for long-haul flights on file.',
    photoUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=85',
    ownerName: 'Henry Whitmore',
    householdName: 'Whitmore Heritage Vault',
  },
  {
    name: 'Zelda',
    species: 'dog',
    breed: 'Australian Shepherd',
    gender: 'female',
    birthDate: '2018-08-15',
    weight: '22 kg',
    coatColor: 'Blue merle',
    diet: 'Active breed high-protein',
    microchipId: '985112004321009',
    conditionsNotes: 'Agility-trained. Requires extended walk windows during transit layovers.',
    photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&q=85',
    ownerName: 'Camille Dubois',
    householdName: 'Dubois Alpine Vault',
  },
  {
    name: 'Percy',
    species: 'dog',
    breed: 'Corgi',
    gender: 'male',
    birthDate: '2022-07-04',
    weight: '11 kg',
    coatColor: 'Pembroke red',
    diet: 'Portion-controlled royal blend',
    microchipId: '985112004321010',
    conditionsNotes: 'Royal household naming convention. EU pet passport primary.',
    photoUrl: 'https://images.unsplash.com/photo-1616007378391-b7dfd04e02f2?w=1200&q=85',
    ownerName: 'Victoria Pemberton',
    householdName: 'Pemberton Crown Vault',
  },
];

const CHECK_IN_NOTES = [
  'Morning riverside walk — excellent energy.',
  'Premium meals on schedule. Hydration optimal.',
  'Grooming day — coat gleaming for travel photos.',
  'Calm evening; practicing carrier acclimation.',
  'Park socialization — confident around new scents.',
  'Rest day after agility session. Weight stable.',
  'Pre-travel wellness check — all vitals green.',
];

const MOMENT_CAPTIONS = [
  'First-class lounge acclimation — totally unbothered.',
  'Passport photo day. Absolutely nailed it.',
  'Sunset walk along the embankment before relocation week.',
];

const DOCUMENT_SPECS = [
  { fileName: 'EU-Pet-Travel-Passport.pdf', title: 'EU Pet Travel Passport' },
  { fileName: 'Rabies-Titer-Certificate.pdf', title: 'Rabies Titer Certificate' },
  { fileName: 'International-Health-Summary.pdf', title: 'International Health Summary' },
];

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function findUserByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<User | null> {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);

    const match = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;

    if (data.users.length < 1000) return null;
    page += 1;
  }
}

async function purgeExistingSandboxUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data: pets } = await supabase.from('pets').select('id').eq('owner_id', userId);
  const petIds = (pets ?? []).map((p) => p.id);

  if (petIds.length > 0) {
    await supabase.from('pets').delete().in('id', petIds);
  }

  const { data: households } = await supabase
    .from('households')
    .select('id')
    .eq('billing_owner_user_id', userId);

  for (const household of households ?? []) {
    await supabase.from('household_members').delete().eq('household_id', household.id);
    await supabase.from('households').delete().eq('id', household.id);
  }

  await supabase.from('subscriptions').delete().eq('user_id', userId);

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) throw new Error(`deleteUser failed: ${deleteError.message}`);
}

async function waitForProfile(supabase: SupabaseClient, userId: string): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Profile row not created for user ${userId}`);
}

// ── Seed one account ──────────────────────────────────────────────────────────

let cachedPdfBytes: Uint8Array | null = null;

async function getDummyPdfBytes(): Promise<Uint8Array> {
  if (cachedPdfBytes) return cachedPdfBytes;

  const response = await fetch(DUMMY_PDF_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch dummy PDF (${response.status})`);
  }

  cachedPdfBytes = new Uint8Array(await response.arrayBuffer());
  return cachedPdfBytes;
}

function buildStoragePath(
  ownerId: string,
  petId: string,
  documentId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${ownerId}/${petId}/${documentId}/${safeName}`;
}

async function seedSandboxAccount(
  supabase: SupabaseClient,
  index: number,
  dryRun: boolean,
): Promise<void> {
  const email = `test${index}@gmail.com`;
  const persona = PET_PERSONAS[(index - 1) % PET_PERSONAS.length];

  if (dryRun) {
    console.log(`[dry-run] Would seed ${email} → ${persona.name} (${persona.breed})`);
    return;
  }

  const existing = await findUserByEmail(supabase, email);
  if (existing) {
    console.log(`  ↻ Replacing existing account ${email}`);
    await purgeExistingSandboxUser(supabase, existing.id);
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: SANDBOX_PASSWORD,
    email_confirm: true,
    user_metadata: { name: persona.ownerName, full_name: persona.ownerName },
  });

  if (createError || !created.user) {
    throw new Error(`createUser failed for ${email}: ${createError?.message}`);
  }

  const userId = created.user.id;
  await waitForProfile(supabase, userId);

  const expiresAt = new Date();
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);

  const { error: subError } = await supabase.from('subscriptions').insert({
    user_id: userId,
    plan: 'pro',
    status: 'active',
    razorpay_order_id: `sandbox-order-${index}`,
    razorpay_payment_id: `sandbox-payment-${index}-${userId.slice(0, 8)}`,
    started_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  if (subError) throw new Error(`subscriptions insert failed: ${subError.message}`);

  const { error: syncError } = await supabase.rpc('sync_profile_subscription_tier', {
    p_user_id: userId,
  });
  if (syncError) throw new Error(`sync_profile_subscription_tier failed: ${syncError.message}`);

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name: persona.ownerName,
      onboarding_completed: true,
      subscription_plan: 'pro',
      subscription_status: 'active',
      subscription_tier: 'premium',
    })
    .eq('user_id', userId);

  if (profileError) throw new Error(`profiles update failed: ${profileError.message}`);

  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({
      name: persona.householdName,
      plan_tier: 'pro',
      billing_owner_user_id: userId,
    })
    .select('id')
    .single();

  if (householdError || !household) {
    throw new Error(`households insert failed: ${householdError?.message}`);
  }

  const householdId = household.id;

  const { error: memberError } = await supabase.from('household_members').insert({
    household_id: householdId,
    user_id: userId,
    role: 'owner',
  });

  if (memberError) throw new Error(`household_members insert failed: ${memberError.message}`);

  const { data: pet, error: petError } = await supabase
    .from('pets')
    .insert({
      owner_id: userId,
      household_id: householdId,
      name: persona.name,
      species: persona.species,
      breed: persona.breed,
      birth_date: persona.birthDate,
      weight: persona.weight,
      gender: persona.gender,
      photo_url: persona.photoUrl,
      diet: persona.diet,
      coat_color: persona.coatColor,
      microchip_id: persona.microchipId,
      conditions_notes: persona.conditionsNotes,
    })
    .select('id')
    .single();

  if (petError || !pet) throw new Error(`pets insert failed: ${petError?.message}`);

  const petId = pet.id;
  const pdfBytes = await getDummyPdfBytes();

  const docCount = index % 2 === 0 ? 3 : 2;
  const documentIds: string[] = [];

  for (let d = 0; d < docCount; d++) {
    const spec = DOCUMENT_SPECS[d];
    const documentId = randomUUID();
    const storagePath = buildStoragePath(userId, petId, documentId, spec.fileName);
    const uploadedAt = isoTimestampDaysAgo(45 - d * 12, 14 + d);

    const { error: uploadError } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) throw new Error(`storage upload failed: ${uploadError.message}`);

    const { error: docError } = await supabase.from('pet_documents').insert({
      id: documentId,
      pet_id: petId,
      file_name: spec.fileName,
      file_type: 'application/pdf',
      storage_path: storagePath,
      uploaded_at: uploadedAt,
    });

    if (docError) throw new Error(`pet_documents insert failed: ${docError.message}`);
    documentIds.push(documentId);
  }

  const healthRecords = [
    {
      record_type: 'vaccination',
      title: 'Rabies Vaccine (1-year)',
      description: 'Nobivac Rabies — administered by Dr. Hartley, Kensington Vet Group.',
      date_recorded: isoDateDaysAgo(240),
      next_due_date: addMonthsIsoDate(isoDateDaysAgo(240), 12),
      source_document_id: documentIds[1] ?? null,
    },
    {
      record_type: 'vaccination',
      title: 'DHPP / Parvo Booster',
      description: 'Core combination vaccine. Lot #PV-2024-8812.',
      date_recorded: isoDateDaysAgo(300),
      next_due_date: addMonthsIsoDate(isoDateDaysAgo(300), 12),
      source_document_id: null,
    },
    {
      record_type: 'wellness',
      title: 'ISO Microchip Placement',
      description: `Microchip ${persona.microchipId} scanned and verified.`,
      date_recorded: isoDateDaysAgo(365),
      next_due_date: null,
      source_document_id: null,
    },
    {
      record_type: 'wellness',
      title: 'Annual Wellness Examination',
      description: 'Full physical, dental grade 1, cleared for international travel.',
      date_recorded: isoDateDaysAgo(90),
      next_due_date: addMonthsIsoDate(isoDateDaysAgo(90), 12),
      source_document_id: documentIds[0] ?? null,
    },
    {
      record_type: 'vaccination',
      title: 'Bordetella (Kennel Cough)',
      description: 'Intranasal vaccine prior to boutique boarding stay.',
      date_recorded: isoDateDaysAgo(150),
      next_due_date: addMonthsIsoDate(isoDateDaysAgo(150), 6),
      source_document_id: null,
    },
  ];

  const { error: recordsError } = await supabase.from('health_records').insert(
    healthRecords.map((r) => ({ ...r, pet_id: petId })),
  );

  if (recordsError) throw new Error(`health_records insert failed: ${recordsError.message}`);

  const checkInRows = Array.from({ length: 7 }, (_, day) => ({
    pet_id: petId,
    check_in_date: isoDateDaysAgo(6 - day),
    feeding: day % 2 === 0 ? 'Premium meals on schedule' : 'Rotational diet — excellent appetite',
    walk_distance_km: 2.4 + (index % 5) * 0.3 + day * 0.1,
    weight_kg: 10 + (index % 8) + day * 0.02,
    notes: CHECK_IN_NOTES[(index + day) % CHECK_IN_NOTES.length],
    logged_by_user_id: userId,
  }));

  const { error: checkInError } = await supabase.from('daily_check_ins').insert(checkInRows);
  if (checkInError) throw new Error(`daily_check_ins insert failed: ${checkInError.message}`);

  const momentRows = MOMENT_CAPTIONS.slice(0, 2 + (index % 2)).map((caption, m) => ({
    pet_id: petId,
    household_id: householdId,
    created_by: userId,
    caption,
    photo_url: persona.photoUrl,
    occurred_at: isoTimestampDaysAgo(14 - m * 5, 17),
    type: 'manual' as const,
  }));

  const { error: momentsError } = await supabase.from('pet_moments').insert(momentRows);
  if (momentsError) throw new Error(`pet_moments insert failed: ${momentsError.message}`);

  const scoreBase = 78 + (index % 12);
  const scoreRows = [0, 7, 14, 21].map((days, s) => ({
    pet_id: petId,
    score: Math.min(96, scoreBase + s),
    factors_json: {
      records: 85 + s,
      checkIns: 80 + s * 2,
      documents: 90,
      reminders: 75 + s,
    },
    recorded_at: isoTimestampDaysAgo(days, 9),
  }));

  const { error: scoreError } = await supabase
    .from('pet_care_score_snapshots')
    .insert(scoreRows);

  if (scoreError) throw new Error(`pet_care_score_snapshots insert failed: ${scoreError.message}`);

  const { error: reminderError } = await supabase.from('reminders').insert({
    pet_id: petId,
    title: 'Rabies booster due',
    category: 'vaccinations',
    due_date: addMonthsIsoDate(isoDateDaysAgo(240), 12),
    notes: 'Schedule with Kensington Vet Group — allow 3-week lead for travel certificates.',
    priority: 'high',
    recurring: 'yearly',
    completed: false,
  });

  if (reminderError) throw new Error(`reminders insert failed: ${reminderError.message}`);

  console.log(`  ✓ ${email} → ${persona.name} (${persona.breed}) · Pro · household ${householdId.slice(0, 8)}…`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { from, to, dryRun } = parseArgs();
  const supabase = getSupabaseAdmin();

  console.log('');
  console.log('PetClues Sandbox Seeder');
  console.log('───────────────────────');
  console.log(`Range: test${from}@gmail.com … test${to}@gmail.com`);
  console.log(`Password (all accounts): ${SANDBOX_PASSWORD}`);
  if (dryRun) console.log('Mode: DRY RUN (no database writes)');
  console.log('');

  for (let i = from; i <= to; i++) {
    try {
      await seedSandboxAccount(supabase, i, dryRun);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ test${i}@gmail.com failed: ${message}`);
      process.exitCode = 1;
      break;
    }
  }

  console.log('');
  if (!process.exitCode) {
    console.log(dryRun ? 'Dry run complete.' : 'Sandbox accounts ready.');
    console.log('Hand prospects: test1@gmail.com / Petclues@0209 (or any testN in range).');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

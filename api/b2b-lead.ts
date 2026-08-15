/**
 * B2B lead capture + sandbox session for agency/breeder portals.
 *
 * POST /api/b2b-lead
 * Body: { companyName, contactEmail, monthlyVolume, vertical, sourcePath }
 *
 * Stores lead telemetry (best-effort) and returns sandbox auth tokens
 * using SANDBOX_DEMO_* credentials - same vault as ephemeral PLG.
 */
import { createClient } from '@supabase/supabase-js';

type Req = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type Res = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
    end: (body?: string) => void;
  };
};

type LeadBody = {
  companyName?: string;
  contactEmail?: string;
  monthlyVolume?: number;
  vertical?: string;
  sourcePath?: string;
};

function readBody(req: Req): LeadBody {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as LeadBody;
    } catch {
      return {};
    }
  }
  if (typeof req.body === 'object') return req.body as LeadBody;
  return {};
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function persistLead(lead: {
  companyName: string;
  contactEmail: string;
  monthlyVolume: number;
  vertical: string;
  sourcePath: string;
}): Promise<void> {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.info('[b2b-lead]', JSON.stringify({ ...lead, at: new Date().toISOString() }));
    return;
  }

  try {
    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Best-effort insert into optional leads table; ignore schema miss.
    await admin.from('b2b_leads' as never).insert({
      company_name: lead.companyName,
      contact_email: lead.contactEmail,
      monthly_volume: lead.monthlyVolume,
      vertical: lead.vertical,
      source_path: lead.sourcePath,
      created_at: new Date().toISOString(),
    } as never);
  } catch (error) {
    console.warn('[b2b-lead] persist skipped', error);
    console.info('[b2b-lead]', JSON.stringify({ ...lead, at: new Date().toISOString() }));
  }
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = readBody(req);
  const companyName = (body.companyName || '').trim();
  const contactEmail = (body.contactEmail || '').trim().toLowerCase();
  const monthlyVolume = Number(body.monthlyVolume) || 0;
  const vertical = (body.vertical || 'agency').trim();
  const sourcePath = (body.sourcePath || '').trim();

  if (!companyName || companyName.length < 2) {
    res.status(400).json({ error: 'Company name is required.' });
    return;
  }
  if (!isValidEmail(contactEmail)) {
    res.status(400).json({ error: 'A valid contact email is required.' });
    return;
  }

  await persistLead({
    companyName,
    contactEmail,
    monthlyVolume: Math.max(1, Math.min(500, monthlyVolume || 1)),
    vertical,
    sourcePath,
  });

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const email = process.env.SANDBOX_DEMO_EMAIL;
  const password = process.env.SANDBOX_DEMO_PASSWORD;

  if (!url || !anonKey || !email || !password) {
    res.status(200).json({
      ok: true,
      leadStored: true,
      sandbox: false,
      redirectTo: '/signup?intent=b2b',
    });
    return;
  }

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      res.status(200).json({
        ok: true,
        leadStored: true,
        sandbox: false,
        error: error?.message,
        redirectTo: '/signup?intent=b2b',
      });
      return;
    }

    res.status(200).json({
      ok: true,
      leadStored: true,
      sandbox: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      redirectTo: '/timeline',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    res.status(500).json({ error: message });
  }
}

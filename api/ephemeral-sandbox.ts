/**
 * Zero-friction ephemeral sandbox session for exit-intent PLG.
 *
 * Signs into the dedicated sandbox account using server-only credentials
 * (SANDBOX_DEMO_EMAIL / SANDBOX_DEMO_PASSWORD) and returns tokens for
 * supabase.auth.setSession on the client - never expose the password in JS.
 *
 * Vercel env required:
 *   VITE_SUPABASE_URL (or SUPABASE_URL)
 *   VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 *   SANDBOX_DEMO_EMAIL
 *   SANDBOX_DEMO_PASSWORD
 */
import { createClient } from '@supabase/supabase-js';

type Req = {
  method?: string;
  body?: unknown;
};

type Res = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
    end: (body?: string) => void;
  };
};

function readBody(req: Req): { breed?: string; condition?: string } {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as { breed?: string; condition?: string };
    } catch {
      return {};
    }
  }
  if (typeof req.body === 'object') {
    return req.body as { breed?: string; condition?: string };
  }
  return {};
}

export default async function handler(req: Req, res: Res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const email = process.env.SANDBOX_DEMO_EMAIL;
  const password = process.env.SANDBOX_DEMO_PASSWORD;

  if (!url || !anonKey || !email || !password) {
    res.status(503).json({
      error:
        'Ephemeral sandbox is not configured. Set SANDBOX_DEMO_EMAIL and SANDBOX_DEMO_PASSWORD on the server.',
    });
    return;
  }

  const { breed, condition } = readBody(req);

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      res.status(401).json({
        error: error?.message || 'Sandbox sign-in failed. Verify sandbox credentials.',
      });
      return;
    }

    res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      redirectTo: '/timeline',
      context: { breed: breed ?? null, condition: condition ?? null },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected sandbox error';
    res.status(500).json({ error: message });
  }
}

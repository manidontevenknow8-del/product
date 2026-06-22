type Headers = Record<string, string | string[] | undefined>;

function headerValue(headers: Headers, name: string): string | null {
  const value = headers[name.toLowerCase()] ?? headers[name];
  if (typeof value === 'string' && value.length > 0) return value;
  return null;
}

function readCountry(headers: Headers): { country: string | null; source: 'vercel' | 'cloudflare' | null } {
  const vercelCountry = headerValue(headers, 'x-vercel-ip-country');
  if (vercelCountry && vercelCountry.length === 2) {
    return { country: vercelCountry.toUpperCase(), source: 'vercel' };
  }

  const cfCountry = headerValue(headers, 'cf-ipcountry');
  if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX') {
    return { country: cfCountry.toUpperCase(), source: 'cloudflare' };
  }

  return { country: null, source: null };
}

export default function handler(
  req: { headers: Headers },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: unknown) => void };
  },
) {
  const { country, source } = readCountry(req.headers);
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ country, source });
}

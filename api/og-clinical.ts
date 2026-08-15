/**
 * Dynamic Open Graph image for breed-condition pSEO pages.
 *
 * URL: /api/og-clinical?breed=French%20Bulldog&condition=BOAS&risk=Severe
 *
 * Node.js runtime (not Edge) - @vercel/og needs WebAssembly, which Edge
 * blocks in this Vite deployment. Uses React.createElement (no JSX).
 */
import { createElement as h } from 'react';
import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'nodejs' };

const WIDTH = 1200;
const HEIGHT = 630;

const RISK_COLORS: Record<string, { accent: string; label: string }> = {
  Severe: { accent: '#e6c577', label: 'SEVERE' },
  High: { accent: '#e6c577', label: 'HIGH' },
  Moderate: { accent: '#7a9a7e', label: 'MODERATE' },
};

function clamp(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function readParams(req: { url?: string; query?: Record<string, string | string[]> }) {
  if (req.query && typeof req.query === 'object') {
    const q = req.query;
    const one = (key: string) => {
      const v = q[key];
      return Array.isArray(v) ? v[0] : v;
    };
    return {
      breed: clamp(one('breed') || 'Breed', 48),
      condition: clamp(one('condition') || 'Condition', 48),
      riskRaw: one('risk') || 'High',
    };
  }

  const url = new URL(req.url || 'http://localhost/api/og-clinical', 'https://petclues.com');
  return {
    breed: clamp(url.searchParams.get('breed') || 'Breed', 48),
    condition: clamp(url.searchParams.get('condition') || 'Condition', 48),
    riskRaw: url.searchParams.get('risk') || 'High',
  };
}

export default async function handler(
  req: { url?: string; query?: Record<string, string | string[]> },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { end: (body?: string) => void; send: (body: Buffer) => void };
    end: (body?: string) => void;
  },
) {
  try {
    const { breed, condition, riskRaw } = readParams(req);
    const riskKey = RISK_COLORS[riskRaw] ? riskRaw : 'High';
    const risk = RISK_COLORS[riskKey];
    const title = `Clinical Tracking: ${condition} in ${breed}s`;

    const image = new ImageResponse(
      h(
        'div',
        {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 72px',
            background: 'linear-gradient(145deg, #080d09 0%, #1c2b1d 52%, #243528 100%)',
            color: '#f7f1e6',
            fontFamily: 'Georgia, "Times New Roman", serif',
          },
        },
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                fontSize: 28,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#e6c577',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 700,
              },
            },
            'PETCLUES',
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                padding: '10px 18px',
                border: `1px solid ${risk.accent}`,
                background: 'rgba(0,0,0,0.25)',
                color: risk.accent,
                fontSize: 20,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 700,
              },
            },
            `Risk Level: ${risk.label}`,
          ),
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              maxWidth: 980,
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: 22,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#c5bdb4',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
              },
            },
            'Clinical breed dossier',
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: title.length > 52 ? 54 : 64,
                lineHeight: 1.05,
                fontWeight: 500,
                color: '#f7f1e6',
              },
            },
            title,
          ),
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(230, 197, 119, 0.28)',
              paddingTop: 28,
              fontFamily: 'Helvetica, Arial, sans-serif',
            },
          },
          h(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: 22,
                color: '#c5bdb4',
              },
            },
            'Digital health timelines · Passports · Vault records',
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                fontSize: 22,
                color: '#e6c577',
                letterSpacing: '0.08em',
              },
            },
            'petclues.com',
          ),
        ),
      ),
      { width: WIDTH, height: HEIGHT },
    );

    const buffer = Buffer.from(await image.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    );
    res.status(200).send(buffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.setHeader('Content-Type', 'text/plain');
    res.status(500).end(`Failed to generate OG image: ${message}`);
  }
}

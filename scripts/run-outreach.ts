/**
 * run-outreach.ts
 *
 * Autonomous Centurion outreach dispatch via Titan SMTP (nodemailer).
 * Loads leads from src/data/outreachLeads.json and sends personalized
 * digital-handover-vault emails.
 *
 * Prerequisites:
 *   Add TITAN_* vars to `.env` or `.env.local` in source-code/ (never commit secrets).
 *   See `.env.example` for the expected keys.
 *
 * Run:
 *   npx tsx scripts/run-outreach.ts --dry-run
 *   npm run outreach:dry
 *   npx tsx scripts/run-outreach.ts
 *
 * Dry-run renders and logs each message without SMTP. Live sends wait
 * 45-90s between messages (skipped in dry-run).
 */

import { config as loadDotenv } from 'dotenv';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import nodemailer from 'nodemailer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// Load dotenv from project root (tsx does not auto-load .env).
loadDotenv({ path: join(PROJECT_ROOT, '.env') });
loadDotenv({ path: join(PROJECT_ROOT, '.env.local') });

const LEADS_PATH = join(PROJECT_ROOT, 'src/data/outreachLeads.json');
const PETCLUES_URL = 'https://petclues.com';
const DELAY_MIN_MS = 45_000;
const DELAY_MAX_MS = 90_000;

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

type OutreachLead = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  vertical: 'IPATA Relocation' | 'Luxury Boarding' | string;
  assignedSandboxEmail: string;
  city: string;
};

function parseArgs(): { dryRun: boolean } {
  return { dryRun: process.argv.includes('--dry-run') };
}

function requireTitanEnv(): {
  email: string;
  password: string;
  host: string;
  port: number;
} {
  const email = process.env.TITAN_EMAIL?.trim();
  const password = process.env.TITAN_PASSWORD?.trim();
  const host = process.env.TITAN_SMTP_HOST?.trim() || 'smtp.titan.email';
  const portRaw = process.env.TITAN_SMTP_PORT?.trim() || '465';
  const port = Number(portRaw);

  const missing: string[] = [];
  if (!email) missing.push('TITAN_EMAIL');
  if (!password) missing.push('TITAN_PASSWORD');
  if (!Number.isFinite(port) || port <= 0) missing.push('TITAN_SMTP_PORT');

  if (missing.length > 0) {
    console.error(
      `${c.red}Missing or invalid Titan SMTP env: ${missing.join(', ')}.${c.reset}`,
    );
    console.error(
      'Add them to `.env` or `.env.local` in source-code/ (see `.env.example`).',
    );
    process.exit(1);
  }

  return { email: email!, password: password!, host, port };
}

function loadLeads(): OutreachLead[] {
  const raw = JSON.parse(readFileSync(LEADS_PATH, 'utf8')) as OutreachLead[];
  if (!Array.isArray(raw) || raw.length === 0) {
    console.error(`${c.red}No leads found in ${LEADS_PATH}${c.reset}`);
    process.exit(1);
  }
  return raw;
}

function subjectFor(lead: OutreachLead): string {
  return `Digital handover vault for ${lead.companyName} clients (pre-configured)`;
}

function plainTextBody(lead: OutreachLead): string {
  const firstName = lead.contactName.split(/\s+/)[0] ?? lead.contactName;

  return [
    `Dear ${firstName},`,
    '',
    `I am writing from PetClues regarding a Centurion-grade digital handover vault prepared for ${lead.companyName} in ${lead.city}.`,
    '',
    `In ${lead.vertical}, the friction of chasing vaccination PDFs, titer clocks, and scattered client records slows every departure. We have pre-configured an evaluation dashboard under ${lead.assignedSandboxEmail} at ${PETCLUES_URL} so your team can inspect the vault without a sales call.`,
    '',
    `If you would like the sandbox password to test the handover flow yourselves, reply to this note and I will send it promptly.`,
    '',
    'With regards,',
    'Founder, PetClues',
    'founder@petclues.com',
  ].join('\n');
}

function htmlBody(lead: OutreachLead): string {
  const firstName = lead.contactName.split(/\s+/)[0] ?? lead.contactName;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subjectFor(lead))}</title>
</head>
<body style="margin:0;padding:0;background:#f7f4ef;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ef;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e4ddd2;padding:36px 40px;">
          <tr>
            <td style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8a7a64;padding-bottom:20px;">
              PetClues · Centurion
            </td>
          </tr>
          <tr>
            <td style="font-size:16px;line-height:1.7;color:#1a1a1a;">
              <p style="margin:0 0 18px;">Dear ${escapeHtml(firstName)},</p>
              <p style="margin:0 0 18px;">
                I am writing from PetClues regarding a Centurion-grade digital handover vault
                prepared for <strong>${escapeHtml(lead.companyName)}</strong> in
                ${escapeHtml(lead.city)}.
              </p>
              <p style="margin:0 0 18px;">
                In ${escapeHtml(lead.vertical)}, the friction of chasing vaccination PDFs,
                titer clocks, and scattered client records slows every departure. We have
                pre-configured an evaluation dashboard under
                <strong>${escapeHtml(lead.assignedSandboxEmail)}</strong> at
                <a href="${PETCLUES_URL}" style="color:#5c4a32;">${PETCLUES_URL}</a>
                so your team can inspect the vault without a sales call.
              </p>
              <p style="margin:0 0 28px;">
                If you would like the sandbox password to test the handover flow yourselves,
                reply to this note and I will send it promptly.
              </p>
              <p style="margin:0;color:#5c4a32;">
                With regards,<br />
                Founder, PetClues<br />
                <a href="mailto:founder@petclues.com" style="color:#5c4a32;">founder@petclues.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function randomDelayMs(): number {
  return Math.floor(Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS + 1)) + DELAY_MIN_MS;
}

async function main(): Promise<void> {
  const { dryRun } = parseArgs();
  const leads = loadLeads();

  console.log(`${c.bold}PetClues outreach dispatch${c.reset}`);
  console.log(`${c.dim}Leads: ${LEADS_PATH}${c.reset}`);
  if (dryRun) {
    console.log(`${c.yellow}Mode: DRY RUN (no SMTP send)${c.reset}`);
  } else {
    console.log(`${c.cyan}Mode: LIVE SEND${c.reset}`);
  }
  console.log('');

  const titan = dryRun
    ? {
        email: process.env.TITAN_EMAIL?.trim() || 'founder@petclues.com',
        password: '',
        host: process.env.TITAN_SMTP_HOST?.trim() || 'smtp.titan.email',
        port: Number(process.env.TITAN_SMTP_PORT?.trim() || '465') || 465,
      }
    : requireTitanEnv();

  const transporter = dryRun
    ? null
    : nodemailer.createTransport({
        host: titan.host,
        port: titan.port,
        secure: true,
        auth: {
          user: titan.email,
          pass: titan.password,
        },
      });

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i]!;
    const subject = subjectFor(lead);
    const text = plainTextBody(lead);
    const html = htmlBody(lead);

    console.log(
      `${c.cyan}Preparing${c.reset} [${lead.id}] ${lead.companyName} → ${lead.email}`,
    );
    console.log(`${c.dim}  Subject: ${subject}${c.reset}`);
    console.log(`${c.dim}  Sandbox: ${lead.assignedSandboxEmail} · ${lead.city} · ${lead.vertical}${c.reset}`);

    if (dryRun) {
      console.log(`${c.yellow}  [dry-run] Would send from ${titan.email}${c.reset}`);
      console.log(`${c.dim}--- plain text ---${c.reset}`);
      console.log(text);
      console.log(`${c.dim}--- end ---${c.reset}`);
      console.log(`${c.green}  OK (dry-run)${c.reset}\n`);
    } else {
      const info = await transporter!.sendMail({
        from: `"PetClues" <${titan.email}>`,
        to: lead.email,
        subject,
        text,
        html,
      });
      console.log(
        `${c.green}  Sent${c.reset} messageId=${info.messageId ?? '(none)'}\n`,
      );
    }

    const isLast = i === leads.length - 1;
    if (!isLast && !dryRun) {
      const waitMs = randomDelayMs();
      console.log(
        `${c.dim}Waiting ${Math.round(waitMs / 1000)}s before next send…${c.reset}\n`,
      );
      await delay(waitMs);
    }
  }

  console.log(
    dryRun
      ? `${c.bold}Dry run complete.${c.reset} ${leads.length} message(s) rendered.`
      : `${c.bold}Dispatch complete.${c.reset} ${leads.length} message(s) sent.`,
  );
}

main().catch((err: unknown) => {
  console.error(`${c.red}Outreach failed:${c.reset}`, err);
  process.exit(1);
});

const BRAND = {
  name: 'PetClues',
  accent: '#C4A882',
  accentDark: '#8B7355',
  bg: '#FAF8F5',
  card: '#FFFFFF',
  text: '#2C2C2C',
  muted: '#6B6560',
  border: '#E8E4DE',
  supportEmail: 'support@petclues.com',
};

const DEFAULT_DISCLAIMER =
  'PetClues is an organization and reminder tool, not veterinary advice. Always consult a licensed veterinarian for medical decisions.';

type LayoutOptions = {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  showDisclaimer?: boolean;
};

export function renderEmailLayout(options: LayoutOptions): string {
  const {
    preheader,
    title,
    bodyHtml,
    ctaLabel,
    ctaUrl,
    footerNote,
    showDisclaimer = true,
  } = options;

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `
        <tr>
          <td style="padding: 28px 0 8px;">
            <a href="${ctaUrl}" style="display: inline-block; background-color: ${BRAND.accent}; color: #FFFFFF; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 28px; border-radius: 8px; mso-padding-alt: 0;">
              ${ctaLabel}
            </a>
          </td>
        </tr>`
      : '';

  const disclaimerBlock = showDisclaimer
    ? `<p style="margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: ${BRAND.muted};">${DEFAULT_DISCLAIMER}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <!--[if mso]><style>body, table, td { font-family: Georgia, serif !important; }</style><![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.text}; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BRAND.bg};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: ${BRAND.card}; border-radius: 12px; border: 1px solid ${BRAND.border}; overflow: hidden;">
          <tr>
            <td style="padding: 28px 32px 16px; border-bottom: 1px solid ${BRAND.border};">
              <p style="margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 500; color: ${BRAND.accentDark}; letter-spacing: 0.02em;">${BRAND.name}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 500; line-height: 1.3; color: ${BRAND.text};">${title}</h1>
              ${bodyHtml}
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px 28px; background-color: ${BRAND.bg}; border-top: 1px solid ${BRAND.border};">
              <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: ${BRAND.muted};">
                ${footerNote ?? 'You received this because of activity on your PetClues account.'}
              </p>
              ${disclaimerBlock}
              <p style="margin: 8px 0 0; font-size: 12px; color: ${BRAND.muted};">
                Questions? <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.accentDark}; text-decoration: none;">${BRAND.supportEmail}</a>
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: ${BRAND.muted};">
                © ${new Date().getFullYear()} PetClues · Gentle pet care, organized.
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

export function renderDetailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: ${BRAND.muted}; width: 120px; vertical-align: top;">${label}</td>
      <td style="padding: 8px 0; font-size: 15px; color: ${BRAND.text}; font-weight: 500;">${value}</td>
    </tr>`;
}

export function renderDetailsTable(rows: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0; background: ${BRAND.bg}; border-radius: 8px; padding: 4px 16px;">${rows}</table>`;
}

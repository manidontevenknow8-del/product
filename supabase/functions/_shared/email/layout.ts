import { BRAND, escapeHtml, renderPrimaryButton, renderSecondaryLink } from './emailComponents.ts';

const DEFAULT_DISCLAIMER =
  'PetClues is an organization and reminder tool, not veterinary advice. Always consult a licensed veterinarian for medical decisions.';

export type LayoutOptions = {
  preheader: string;
  title: string;
  eyebrow?: string;
  bodyHtml: string;
  heroHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryLinks?: Array<{ label: string; url: string }>;
  footerNote?: string;
  showDisclaimer?: boolean;
  appBaseUrl?: string;
  hideTitle?: boolean;
};

export function renderEmailLayout(options: LayoutOptions): string {
  const {
    preheader,
    title,
    eyebrow,
    bodyHtml,
    heroHtml,
    ctaLabel,
    ctaUrl,
    secondaryLinks,
    footerNote,
    showDisclaimer = true,
    appBaseUrl = BRAND.appUrl,
    hideTitle = false,
  } = options;

  const logoUrl = `${appBaseUrl.replace(/\/$/, '')}/logo.png`;

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `
        <tr>
          <td align="center" style="padding: 10px 0 4px;">
            ${renderPrimaryButton(ctaLabel, ctaUrl)}
          </td>
        </tr>`
      : '';

  const secondaryBlock =
    secondaryLinks?.length
      ? `
        <tr>
          <td align="center" style="padding: 20px 0 0;">
            <p style="margin: 0; font-size: 14px; line-height: 2; color: ${BRAND.muted};">
              ${secondaryLinks.map((link) => renderSecondaryLink(link.label, link.url)).join('&nbsp;&nbsp;&nbsp;')}
            </p>
          </td>
        </tr>`
      : '';

  const disclaimerBlock = showDisclaimer
    ? `<p style="margin: 12px 0 0; font-size: 12px; line-height: 1.55; color: ${BRAND.light};">${DEFAULT_DISCLAIMER}</p>`
    : '';

  const eyebrowBlock = eyebrow && !heroHtml
    ? `<p style="margin: 0 0 10px; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${BRAND.sage};">${escapeHtml(eyebrow)}</p>`
    : '';

  const titleBlock = hideTitle
    ? ''
    : `<h1 style="margin: 0 0 20px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 500; line-height: 1.2; letter-spacing: -0.02em; color: ${BRAND.text};">${escapeHtml(title)}</h1>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><style>body, table, td { font-family: Georgia, serif !important; }</style><![endif]-->
</head>
<body style="margin: 0; padding: 0; background: ${BRAND.bgGradient}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.text}; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(preheader)}&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: ${BRAND.bgGradient};">
    <tr>
      <td align="center" style="padding: 36px 16px 48px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 0 0 22px;">
              <a href="${escapeHtml(appBaseUrl)}" style="text-decoration: none; display: inline-block;">
                <img src="${escapeHtml(logoUrl)}" alt="PetClues" width="36" height="36" style="display: inline-block; vertical-align: middle; border-radius: 10px;" />
                <span style="display: inline-block; vertical-align: middle; margin-left: 10px; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 500; color: ${BRAND.primary}; letter-spacing: 0.01em;">PetClues</span>
              </a>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BRAND.bgElevated}; border-radius: 16px; border: 1px solid ${BRAND.border}; overflow: hidden; box-shadow: 0 16px 48px rgba(44, 62, 53, 0.07);">
                <tr>
                  <td style="padding: ${heroHtml ? '0' : '36px 32px 28px'};">
                    ${heroHtml ?? ''}
                    <div style="padding: ${heroHtml ? '0 32px 32px' : '0'};">
                      ${eyebrowBlock}
                      ${titleBlock}
                      ${bodyHtml}
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        ${ctaBlock}
                        ${secondaryBlock}
                      </table>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 32px 28px; background-color: ${BRAND.bgMuted}; border-top: 1px solid ${BRAND.border};">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid ${BRAND.border};">
                          <p style="margin: 0 0 10px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${BRAND.sage};">PetClues</p>
                          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: ${BRAND.muted};">
                            ${footerNote ?? 'You received this email because of activity on your PetClues account.'}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px;">
                          ${disclaimerBlock}
                          <p style="margin: ${showDisclaimer ? '12px' : '0'} 0 0; font-size: 12px; line-height: 1.7; color: ${BRAND.light};">
                            <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.sage}; text-decoration: none; font-weight: 500;">${BRAND.supportEmail}</a>
                            &nbsp;&nbsp;·&nbsp;&nbsp;
                            <a href="${escapeHtml(appBaseUrl)}/settings" style="color: ${BRAND.sage}; text-decoration: none; font-weight: 500;">Notification settings</a>
                            &nbsp;&nbsp;·&nbsp;&nbsp;
                            <a href="${escapeHtml(appBaseUrl)}/privacy" style="color: ${BRAND.sage}; text-decoration: none; font-weight: 500;">Privacy</a>
                          </p>
                          <p style="margin: 12px 0 0; font-size: 12px; color: ${BRAND.light};">
                            © ${new Date().getFullYear()} PetClues
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** @deprecated Use emailComponents.renderDetailRow */
export function renderDetailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: ${BRAND.muted}; width: 120px; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 8px 0; font-size: 15px; color: ${BRAND.text}; font-weight: 500;">${value}</td>
    </tr>`;
}

/** @deprecated Use emailComponents.renderDetailsCard */
export function renderDetailsTable(rows: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0; background: ${BRAND.bgMuted}; border-radius: 8px; padding: 4px 16px;">${rows}</table>`;
}

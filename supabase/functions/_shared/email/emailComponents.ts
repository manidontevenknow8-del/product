/** Reusable HTML blocks for transactional email — table-based for client compatibility. */

/** Mirrors src/styles/tokens.css — warm cream + forest sage, not black/gold. */
export const BRAND = {
  name: 'PetClues',
  appUrl: 'https://petclues.com',
  logoUrl: 'https://petclues.com/logo.png',
  bg: '#FAF9F7',
  bgMuted: '#F3F1ED',
  bgElevated: '#FFFFFF',
  bgGradient: 'linear-gradient(165deg, #f5f3ef 0%, #faf9f7 42%, #eef4f0 100%)',
  primary: '#2C3E35',
  primaryHover: '#3a5247',
  sage: '#5A8F7B',
  sageLight: '#E8F2ED',
  sageMuted: '#7BA392',
  accentWarm: '#C4A882',
  accentLight: '#E8D9C4',
  text: '#1A1F1C',
  textSecondary: '#4A524C',
  muted: '#6B7269',
  light: '#9BA39A',
  border: '#E8E5DF',
  borderLight: '#F0EDE8',
  success: '#5A8F7B',
  successBg: '#E8F2ED',
  warning: '#B45309',
  warningBg: '#FFF7ED',
  danger: '#B85C5C',
  dangerBg: '#FDF2F2',
  supportEmail: 'support@petclues.com',
} as const;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizePhotoUrlForEmail(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:')) return null;
  if (trimmed.startsWith('https://')) return trimmed;
  return null;
}

export function getAvatarInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

export function renderPetAvatar(
  name: string,
  photoUrl: string | null | undefined,
  size = 56,
): string {
  const safeName = escapeHtml(name);
  const initials = escapeHtml(getAvatarInitials(name));
  const resolved = normalizePhotoUrlForEmail(photoUrl);
  const radius = Math.round(size / 2);

  if (resolved) {
    return `
      <img
        src="${escapeHtml(resolved)}"
        alt="${safeName}"
        width="${size}"
        height="${size}"
        style="display: block; width: ${size}px; height: ${size}px; border-radius: ${radius}px; object-fit: cover; border: 3px solid ${BRAND.bgElevated}; box-shadow: 0 4px 14px rgba(44, 62, 53, 0.12);"
      />`;
  }

  return `
    <div style="width: ${size}px; height: ${size}px; border-radius: ${radius}px; background: linear-gradient(145deg, ${BRAND.sageLight} 0%, ${BRAND.accentLight} 100%); color: ${BRAND.primary}; font-family: Georgia, 'Times New Roman', serif; font-size: ${Math.round(size * 0.34)}px; font-weight: 500; line-height: ${size}px; text-align: center; letter-spacing: 0.02em; border: 3px solid ${BRAND.bgElevated}; box-shadow: 0 4px 14px rgba(44, 62, 53, 0.08);">
      ${initials}
    </div>`;
}

/** Full-width pet photo strip for card headers (Chewy / Bark-style). */
export function renderPetPhotoStrip(
  name: string,
  photoUrl: string | null | undefined,
  height = 140,
): string {
  const safeName = escapeHtml(name);
  const resolved = normalizePhotoUrlForEmail(photoUrl);
  const initials = escapeHtml(getAvatarInitials(name));

  if (resolved) {
    return `
      <img
        src="${escapeHtml(resolved)}"
        alt="${safeName}"
        width="536"
        height="${height}"
        style="display: block; width: 100%; max-width: 536px; height: ${height}px; object-fit: cover; object-position: center 35%;"
      />`;
  }

  return `
    <div style="width: 100%; height: ${height}px; background: linear-gradient(135deg, ${BRAND.sageLight} 0%, ${BRAND.bgMuted} 55%, ${BRAND.accentLight} 100%); text-align: center; line-height: ${height}px;">
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 42px; font-weight: 500; color: ${BRAND.sage}; letter-spacing: 0.06em;">${initials}</span>
    </div>`;
}

export function renderEyebrow(text: string): string {
  return `
    <p style="margin: 0 0 10px; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${BRAND.sage};">
      ${escapeHtml(text)}
    </p>`;
}

export function renderLead(text: string): string {
  return `
    <p style="margin: 0 0 22px; font-size: 16px; line-height: 1.7; color: ${BRAND.textSecondary};">
      ${text}
    </p>`;
}

export function renderSectionLabel(text: string): string {
  return `
    <p style="margin: 0 0 10px; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${BRAND.muted};">
      ${escapeHtml(text)}
    </p>`;
}

export function renderStatPill(
  label: string,
  value: string,
  tone: 'default' | 'warning' | 'success' = 'default',
): string {
  const palette = {
    default: { bg: BRAND.bgMuted, text: BRAND.primary, border: BRAND.border, accent: BRAND.sage },
    warning: { bg: BRAND.warningBg, text: BRAND.warning, border: '#FED7AA', accent: BRAND.warning },
    success: { bg: BRAND.successBg, text: BRAND.success, border: '#BBE5D4', accent: BRAND.sage },
  }[tone];

  return `
    <td align="center" style="padding: 4px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${palette.bg}; border: 1px solid ${palette.border}; border-radius: 14px;">
        <tr>
          <td align="center" style="padding: 16px 10px;">
            <p style="margin: 0 0 4px; font-size: 26px; font-weight: 600; line-height: 1; color: ${palette.text}; font-family: Georgia, 'Times New Roman', serif;">
              ${escapeHtml(value)}
            </p>
            <p style="margin: 0; font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${BRAND.muted};">
              ${escapeHtml(label)}
            </p>
          </td>
        </tr>
      </table>
    </td>`;
}

export function renderStatRow(pills: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 28px;">
      <tr>
        ${pills}
      </tr>
    </table>`;
}

export function renderPrimaryButton(label: string, url: string): string {
  return `
    <a
      href="${escapeHtml(url)}"
      style="display: inline-block; background-color: ${BRAND.primary}; color: ${BRAND.bg}; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 999px; mso-padding-alt: 0; letter-spacing: 0.01em;"
    >${escapeHtml(label)}</a>`;
}

export function renderSecondaryLink(label: string, url: string): string {
  return `
    <a href="${escapeHtml(url)}" style="color: ${BRAND.sage}; text-decoration: none; font-size: 14px; font-weight: 600;">
      ${escapeHtml(label)} →
    </a>`;
}

export function renderDivider(): string {
  return `<hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 28px 0;" />`;
}

export function renderDetailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 10px 0; font-size: 13px; color: ${BRAND.muted}; width: 110px; vertical-align: top;">${escapeHtml(label)}</td>
      <td style="padding: 10px 0; font-size: 15px; color: ${BRAND.text}; font-weight: 500; vertical-align: top;">${value}</td>
    </tr>`;
}

export function renderDetailsCard(rows: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0; background: ${BRAND.bgMuted}; border-radius: 14px; border: 1px solid ${BRAND.border};">
      <tr>
        <td style="padding: 4px 18px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${rows}
          </table>
        </td>
      </tr>
    </table>`;
}

export function renderReminderListItem(
  title: string,
  meta: string,
  tone: 'default' | 'warning' = 'default',
): string {
  const dot = tone === 'warning' ? BRAND.warning : BRAND.sage;
  const bg = tone === 'warning' ? BRAND.warningBg : BRAND.bgElevated;
  return `
    <tr>
      <td style="padding: 8px 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: ${bg}; border-radius: 10px; border: 1px solid ${BRAND.borderLight};">
          <tr>
            <td style="padding: 12px 14px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="8" valign="top" style="padding-top: 7px;">
                    <div style="width: 7px; height: 7px; border-radius: 50%; background: ${dot};"></div>
                  </td>
                  <td style="padding-left: 10px;">
                    <p style="margin: 0 0 3px; font-size: 15px; font-weight: 600; color: ${BRAND.text};">${escapeHtml(title)}</p>
                    <p style="margin: 0; font-size: 13px; color: ${BRAND.muted};">${meta}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

export function renderStatusChip(label: string, tone: 'default' | 'warning' | 'success' = 'default'): string {
  const styles = {
    default: { bg: BRAND.sageLight, color: BRAND.primary, border: '#BBE5D4' },
    warning: { bg: BRAND.warningBg, color: BRAND.warning, border: '#FED7AA' },
    success: { bg: BRAND.successBg, color: BRAND.success, border: '#BBE5D4' },
  }[tone];
  return `<span style="display: inline-block; margin: 0 6px 6px 0; padding: 5px 11px; font-size: 12px; font-weight: 600; color: ${styles.color}; background: ${styles.bg}; border: 1px solid ${styles.border}; border-radius: 999px;">${escapeHtml(label)}</span>`;
}

/** Hero banner for digest emails — soft scrim over a warm pet photo. */
export function renderDigestHeroBanner(title: string, subtitle: string, imageUrl: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 0;">
      <tr>
        <td style="position: relative; padding: 0; border-radius: 16px 16px 0 0; overflow: hidden;">
          <!--[if gte mso 9]>
          <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;height:180px;">
            <v:fill type="frame" src="${escapeHtml(imageUrl)}" color="${BRAND.primary}" />
          </v:rect>
          <![endif]-->
          <div style="background-image: url('${escapeHtml(imageUrl)}'); background-size: cover; background-position: center 40%; height: 180px; border-radius: 16px 16px 0 0;">
            <div style="height: 180px; background: linear-gradient(180deg, rgba(44, 62, 53, 0.15) 0%, rgba(44, 62, 53, 0.72) 100%); padding: 28px 32px; box-sizing: border-box;">
              <p style="margin: 0 0 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(250, 249, 247, 0.85);">Weekly care digest</p>
              <p style="margin: 0 0 6px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 500; line-height: 1.15; color: #FAF9F7; letter-spacing: -0.02em;">${escapeHtml(title)}</p>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: rgba(250, 249, 247, 0.9);">${escapeHtml(subtitle)}</p>
            </div>
          </div>
        </td>
      </tr>
    </table>`;
}

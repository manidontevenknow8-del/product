import {
  BRAND,
  escapeHtml,
  renderDetailsCard,
  renderDetailRow,
  renderDigestHeroBanner,
  renderDivider,
  renderLead,
  renderPetAvatar,
  renderPetPhotoStrip,
  renderReminderListItem,
  renderSectionLabel,
  renderStatPill,
  renderStatRow,
  renderStatusChip,
} from './emailComponents.ts';
import { renderEmailLayout } from './layout.ts';
import { weeklySummarySubject } from './weeklySummaryData.ts';
import type {
  FoundingMemberConfirmationPayload,
  OverdueReminderPayload,
  PremiumUpgradePayload,
  SendEmailInput,
  UpcomingReminderPayload,
  WeeklySummaryPayload,
  WelcomeEmailPayload,
} from './types.ts';

/** Warm lifestyle photo for digest hero, dogs & cats, matches site mood. */
const DIGEST_HERO_IMAGE =
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80';

export function buildEmailContent(input: SendEmailInput): { html: string; text: string } {
  switch (input.type) {
    case 'upcoming_reminder':
      return buildUpcomingReminderEmail(input.payload);
    case 'overdue_reminder':
      return buildOverdueReminderEmail(input.payload);
    case 'weekly_pet_summary':
      return buildWeeklySummaryEmail(input.payload);
    case 'welcome':
      return buildWelcomeEmail(input.payload);
    case 'founding_member_confirmation':
      return buildFoundingMemberEmail(input.payload);
    case 'premium_upgrade':
      return buildPremiumUpgradeEmail(input.payload);
  }
}

function renderPetHero(name: string, photoUrl?: string | null, subtitle?: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 22px; border-radius: 14px; overflow: hidden; border: 1px solid ${BRAND.border};">
      <tr>
        <td style="padding: 0;">
          ${renderPetPhotoStrip(name, photoUrl, 120)}
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 18px; background: ${BRAND.bgMuted};">
          <p style="margin: 0 0 4px; font-size: 20px; font-weight: 600; color: ${BRAND.text}; font-family: Georgia, 'Times New Roman', serif;">
            ${escapeHtml(name)}
          </p>
          ${
            subtitle
              ? `<p style="margin: 0; font-size: 14px; color: ${BRAND.muted};">${escapeHtml(subtitle)}</p>`
              : ''
          }
        </td>
      </tr>
    </table>`;
}

function buildUpcomingReminderEmail(payload: UpcomingReminderPayload) {
  const bodyHtml = `
    ${renderPetHero(payload.petName, payload.petPhotoUrl, 'Upcoming care reminder')}
    ${renderLead(`<strong>${escapeHtml(payload.reminderTitle)}</strong> is coming up for ${escapeHtml(payload.petName)}.`)}
    ${renderDetailsCard(
      renderDetailRow('Due', escapeHtml(payload.dueLabel)) +
        renderDetailRow('Category', escapeHtml(payload.category)) +
        renderDetailRow('Pet', escapeHtml(payload.petName)),
    )}
  `;

  const html = renderEmailLayout({
    preheader: `${payload.reminderTitle} for ${payload.petName}, ${payload.dueLabel}`,
    eyebrow: 'Care reminder',
    title: payload.dueLabel,
    bodyHtml,
    ctaLabel: 'View reminders',
    ctaUrl: payload.remindersUrl,
    secondaryLinks: [{ label: 'Open dashboard', url: payload.remindersUrl.replace(/\/reminders$/, '/dashboard') }],
  });

  const text = [
    `Upcoming: ${payload.reminderTitle} for ${payload.petName}`,
    `Due: ${payload.dueLabel}`,
    `Category: ${payload.category}`,
    '',
    `View reminders: ${payload.remindersUrl}`,
  ].join('\n');

  return { html, text };
}

function buildOverdueReminderEmail(payload: OverdueReminderPayload) {
  const overdueLabel =
    payload.daysOverdue === 1 ? '1 day overdue' : `${payload.daysOverdue} days overdue`;

  const bodyHtml = `
    ${renderPetHero(payload.petName, payload.petPhotoUrl, 'Needs your attention')}
    ${renderLead(`<strong>${escapeHtml(payload.reminderTitle)}</strong> for ${escapeHtml(payload.petName)} is overdue. A quick update keeps their care timeline accurate.`)}
    ${renderDetailsCard(
      renderDetailRow('Status', `<span style="color: ${BRAND.warning}; font-weight: 600;">${escapeHtml(overdueLabel)}</span>`) +
        renderDetailRow('Was due', escapeHtml(payload.dueDate)) +
        renderDetailRow('Category', escapeHtml(payload.category)),
    )}
  `;

  const html = renderEmailLayout({
    preheader: `${payload.reminderTitle} is ${overdueLabel}`,
    eyebrow: 'Overdue reminder',
    title: 'Action needed',
    bodyHtml,
    ctaLabel: 'Take action',
    ctaUrl: payload.remindersUrl,
  });

  const text = [
    `Overdue: ${payload.reminderTitle} for ${payload.petName}`,
    `Status: ${overdueLabel}`,
    `Was due: ${payload.dueDate}`,
    '',
    `View reminders: ${payload.remindersUrl}`,
  ].join('\n');

  return { html, text };
}

function renderWeeklyPetCard(pet: WeeklySummaryPayload['pets'][number]): string {
  const upcomingRows = pet.upcomingReminders
    .map((r) =>
      renderReminderListItem(
        r.title,
        `${escapeHtml(r.dueLabel)} · ${escapeHtml(r.category)}`,
      ),
    )
    .join('');

  const overdueRows = pet.overdueReminders
    .map((r) =>
      renderReminderListItem(
        r.title,
        `${escapeHtml(r.dueLabel)} · ${escapeHtml(r.category)}`,
        'warning',
      ),
    )
    .join('');

  const chips = [
    pet.upcomingCount > 0
      ? renderStatusChip(`${pet.upcomingCount} upcoming`, 'default')
      : '',
    pet.overdueCount > 0
      ? renderStatusChip(`${pet.overdueCount} overdue`, 'warning')
      : '',
    renderStatusChip(
      `${pet.checkInsThisWeek} check-in${pet.checkInsThisWeek === 1 ? '' : 's'} this week`,
      pet.checkInsThisWeek > 0 ? 'success' : 'default',
    ),
  ].join('');

  const encouragement =
    pet.checkInsThisWeek === 0
      ? `<p style="margin: 14px 0 0; padding: 12px 14px; font-size: 13px; line-height: 1.55; color: ${BRAND.textSecondary}; background: ${BRAND.sageLight}; border-radius: 10px; border: 1px solid #BBE5D4;">No check-ins logged this week, a quick daily note helps you spot patterns early.</p>`
      : '';

  const nextCare =
    pet.upcomingReminders[0]
      ? `<p style="margin: 12px 0 0; font-size: 13px; color: ${BRAND.muted};"><strong style="color: ${BRAND.text};">Next up:</strong> ${escapeHtml(pet.upcomingReminders[0].title)} · ${escapeHtml(pet.upcomingReminders[0].dueLabel)}</p>`
      : pet.overdueReminders[0]
        ? `<p style="margin: 12px 0 0; font-size: 13px; color: ${BRAND.warning};"><strong>Needs attention:</strong> ${escapeHtml(pet.overdueReminders[0].title)} · ${escapeHtml(pet.overdueReminders[0].dueLabel)}</p>`
        : `<p style="margin: 12px 0 0; font-size: 13px; color: ${BRAND.muted};">All caught up this week, great work keeping ${escapeHtml(pet.name)}&rsquo;s care on track.</p>`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 20px; border: 1px solid ${BRAND.border}; border-radius: 16px; overflow: hidden; background: ${BRAND.bgElevated}; box-shadow: 0 4px 20px rgba(44, 62, 53, 0.05);">
      <tr>
        <td style="padding: 0;">
          ${renderPetPhotoStrip(pet.name, pet.photoUrl, 150)}
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 20px 0;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td width="52" valign="top" style="padding-right: 12px;">
                ${renderPetAvatar(pet.name, pet.photoUrl, 52)}
              </td>
              <td valign="top">
                <p style="margin: 0 0 4px; font-size: 20px; font-weight: 600; color: ${BRAND.text}; font-family: Georgia, 'Times New Roman', serif;">
                  ${escapeHtml(pet.name)}
                </p>
                <p style="margin: 0 0 10px; font-size: 13px; color: ${BRAND.muted};">${escapeHtml(pet.speciesLabel)}</p>
              </td>
            </tr>
          </table>
          <p style="margin: 0 0 4px; line-height: 1.8;">${chips}</p>
          ${nextCare}
        </td>
      </tr>
      ${
        upcomingRows
          ? `
      <tr>
        <td style="padding: 18px 20px 0;">
          ${renderSectionLabel('Coming up')}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${upcomingRows}</table>
        </td>
      </tr>`
          : ''
      }
      ${
        overdueRows
          ? `
      <tr>
        <td style="padding: 18px 20px 0;">
          ${renderSectionLabel('Needs attention')}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${overdueRows}</table>
        </td>
      </tr>`
          : ''
      }
      <tr>
        <td style="padding: 16px 20px 20px;">
          ${encouragement}
          <p style="margin: ${encouragement ? '12px' : '0'} 0 0;">
            <a href="${escapeHtml(pet.profileUrl)}" style="font-size: 13px; font-weight: 600; color: ${BRAND.sage}; text-decoration: none;">View ${escapeHtml(pet.name)}&rsquo;s profile →</a>
          </p>
        </td>
      </tr>
    </table>`;
}

function buildWeeklySummaryEmail(payload: WeeklySummaryPayload) {
  const firstName = payload.ownerName.trim().split(/\s+/)[0] || 'there';
  const petCards = payload.pets.map(renderWeeklyPetCard).join('');

  const heroHtml = renderDigestHeroBanner(
    'Your care week',
    `Week of ${payload.weekLabel}`,
    DIGEST_HERO_IMAGE,
  );

  const bodyHtml = `
    ${renderLead(`Hi ${escapeHtml(firstName)}, here&rsquo;s a snapshot of care across <strong>${payload.totals.petCount} pet${payload.totals.petCount === 1 ? '' : 's'}</strong>, reminders, check-ins, and what needs attention.`)}
    ${renderStatRow(
      renderStatPill('Upcoming', String(payload.totals.upcoming)) +
        renderStatPill('Overdue', String(payload.totals.overdue), payload.totals.overdue > 0 ? 'warning' : 'default') +
        renderStatPill('Check-ins', String(payload.totals.checkIns), payload.totals.checkIns > 0 ? 'success' : 'default'),
    )}
    ${
      petCards ||
      `<p style="margin: 0; padding: 20px; background: ${BRAND.sageLight}; border-radius: 14px; border: 1px solid #BBE5D4; font-size: 15px; line-height: 1.6; color: ${BRAND.textSecondary};">Add a pet profile with a photo to start receiving personalized weekly snapshots, reminders, check-ins, and care history in one place.</p>`
    }
    ${renderDivider()}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: ${BRAND.bgMuted}; border-radius: 14px; border: 1px solid ${BRAND.border};">
      <tr>
        <td style="padding: 16px 18px;">
          <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: ${BRAND.primary};">Care tip</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.65; color: ${BRAND.textSecondary};">
            Completing reminders and logging quick check-ins keeps your timeline accurate for vet visits and monthly reports.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = renderEmailLayout({
    preheader: `${payload.totals.upcoming} upcoming · ${payload.totals.overdue} overdue · ${payload.totals.checkIns} check-ins`,
    title: 'Your care week',
    bodyHtml,
    heroHtml,
    hideTitle: true,
    ctaLabel: 'Open dashboard',
    ctaUrl: payload.dashboardUrl,
    secondaryLinks: [
      { label: 'Reminders', url: payload.remindersUrl },
      { label: 'Settings', url: payload.settingsUrl },
    ],
    footerNote:
      'Weekly summaries respect your notification preferences. Adjust frequency anytime in Settings.',
  });

  const text = [
    `Your care week, ${payload.weekLabel}`,
    '',
    `Upcoming: ${payload.totals.upcoming} · Overdue: ${payload.totals.overdue} · Check-ins: ${payload.totals.checkIns}`,
    '',
    ...payload.pets.flatMap((pet) => [
      `${pet.name} (${pet.speciesLabel})`,
      `  ${pet.upcomingCount} upcoming · ${pet.overdueCount} overdue · ${pet.checkInsThisWeek} check-ins`,
      ...pet.upcomingReminders.map((r) => `  · ${r.title}, ${r.dueLabel}`),
      ...pet.overdueReminders.map((r) => `  ! ${r.title}, ${r.dueLabel}`),
      '',
    ]),
    `Dashboard: ${payload.dashboardUrl}`,
    `Reminders: ${payload.remindersUrl}`,
  ].join('\n');

  return { html, text };
}

function buildWelcomeEmail(payload: WelcomeEmailPayload) {
  const firstName = payload.ownerName?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : 'Hi there,';
  const bodyHtml = `
    ${renderLead(`${greeting} welcome to PetClues.`)}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 20px;">
      <tr>
        <td style="padding: 18px 20px; background: ${BRAND.sageLight}; border-radius: 14px; border: 1px solid #BBE5D4;">
          <p style="margin: 0 0 10px; font-size: 15px; line-height: 1.65; color: ${BRAND.textSecondary};">
            PetClues helps you organize health records, reminders, documents, and care history in one calm place.
          </p>
          <p style="margin: 0; font-size: 14px; line-height: 1.65; color: ${BRAND.muted};">
            Start by adding a pet profile with a photo, then set your first reminder.
          </p>
        </td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${BRAND.muted};">
      If you haven&rsquo;t verified your email yet, check your inbox for the confirmation link from PetClues.
    </p>`;

  const html = renderEmailLayout({
    preheader: 'Your pet care, beautifully organized.',
    eyebrow: 'Welcome',
    title: 'Glad you\'re here',
    bodyHtml,
    ctaLabel: 'Open your dashboard',
    ctaUrl: payload.dashboardUrl,
    secondaryLinks: [{ label: 'Notification settings', url: payload.settingsUrl }],
    footerNote: 'You received this because you created a PetClues account.',
  });

  const text = [
    'Welcome to PetClues',
    '',
    `${greeting} welcome to PetClues.`,
    'Organize pet records, reminders, documents, and care history in one calm place.',
    '',
    `Dashboard: ${payload.dashboardUrl}`,
    `Settings: ${payload.settingsUrl}`,
  ].join('\n');

  return { html, text };
}

function buildFoundingMemberEmail(payload: FoundingMemberConfirmationPayload) {
  const bodyHtml = `
    ${renderLead('You&rsquo;re on the PetClues founding list. Thank you for helping shape a calmer way to care for pets.')}
    ${renderDetailsCard(
      renderDetailRow('Benefit', 'Founding Member badge at signup') +
        renderDetailRow('Discount', 'Lifetime Pro discount when billing opens'),
    )}
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${BRAND.muted};">
      Create your account with the same email address to apply your badge automatically.
    </p>`;

  const html = renderEmailLayout({
    preheader: 'Founding member spot confirmed.',
    eyebrow: 'Founding member',
    title: 'You\'re on the list',
    bodyHtml,
    ctaLabel: 'Create your account',
    ctaUrl: payload.signupUrl,
    footerNote: 'You received this because you joined the PetClues founding list.',
  });

  const text = [
    'Founding member confirmed',
    '',
    'You are on the PetClues founding list.',
    `Sign up: ${payload.signupUrl}`,
  ].join('\n');

  return { html, text };
}

function buildPremiumUpgradeEmail(payload: PremiumUpgradePayload) {
  const cycleLabel = payload.billingCycle === 'annual' ? 'annual' : payload.billingCycle;
  const firstName = payload.ownerName?.trim().split(/\s+/)[0];
  const safeName = firstName ? escapeHtml(firstName) : 'there';

  const bodyHtml = `
    ${renderLead(`Hi ${safeName}, your PetClues membership is now active.`)}
    ${renderDetailsCard(
      renderDetailRow('Plan', 'Premium membership') +
        renderDetailRow('Billing', escapeHtml(cycleLabel)) +
        (payload.currency ? renderDetailRow('Currency', escapeHtml(payload.currency)) : ''),
    )}
    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${BRAND.muted};">
      You now have access to expanded records, reports, and document tools. Manage billing anytime from your account.
    </p>`;

  const html = renderEmailLayout({
    preheader: 'Your PetClues membership is active.',
    eyebrow: 'Membership',
    title: 'You\'re all set',
    bodyHtml,
    ctaLabel: 'Open dashboard',
    ctaUrl: payload.dashboardUrl,
    secondaryLinks: [{ label: 'Manage billing', url: payload.billingUrl }],
    footerNote: 'You received this because your PetClues membership was updated.',
  });

  const text = [
    'Membership is active',
    '',
    `Hi ${firstName ?? 'there'}, your PetClues membership is active (${cycleLabel}).`,
    `Dashboard: ${payload.dashboardUrl}`,
    `Billing: ${payload.billingUrl}`,
  ].join('\n');

  return { html, text };
}

export function subjectForEmail(input: SendEmailInput): string {
  switch (input.type) {
    case 'upcoming_reminder':
      return `${input.payload.petName}: ${input.payload.reminderTitle}, ${input.payload.dueLabel}`;
    case 'overdue_reminder':
      return `Action needed: ${input.payload.reminderTitle} for ${input.payload.petName}`;
    case 'weekly_pet_summary':
      return weeklySummarySubject(input.payload.pets, input.payload.totals, input.payload.weekLabel);
    case 'welcome':
      return 'Welcome to PetClues';
    case 'founding_member_confirmation':
      return 'You\'re on the PetClues founding list';
    case 'premium_upgrade':
      return 'Your PetClues membership is active';
  }
}

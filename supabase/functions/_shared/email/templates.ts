import { renderDetailRow, renderDetailsTable, renderEmailLayout } from './layout.ts';
import type {
  FoundingMemberConfirmationPayload,
  OverdueReminderPayload,
  PremiumUpgradePayload,
  SendEmailInput,
  UpcomingReminderPayload,
  WeeklySummaryPayload,
  WelcomeEmailPayload,
} from './types.ts';

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

function buildUpcomingReminderEmail(payload: UpcomingReminderPayload) {
  const bodyHtml = `
    <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #2C2C2C;">
      A care reminder for <strong>${payload.petName}</strong> is coming up.
    </p>
    ${renderDetailsTable(
      renderDetailRow('Task', payload.reminderTitle) +
        renderDetailRow('Pet', payload.petName) +
        renderDetailRow('Due', payload.dueLabel) +
        renderDetailRow('Category', payload.category),
    )}
    <p style="margin: 16px 0 0; font-size: 15px; line-height: 1.6; color: #6B6560;">
      Mark it complete in PetClues when finished to keep your care score strong.
    </p>`;

  const html = renderEmailLayout({
    preheader: `${payload.reminderTitle} for ${payload.petName} — ${payload.dueLabel}`,
    title: 'Upcoming care reminder',
    bodyHtml,
    ctaLabel: 'View reminders',
    ctaUrl: payload.remindersUrl,
  });

  const text = [
    'Upcoming care reminder',
    '',
    `${payload.reminderTitle} for ${payload.petName}`,
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
    <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #2C2C2C;">
      <strong>${payload.reminderTitle}</strong> for ${payload.petName} needs your attention.
    </p>
    ${renderDetailsTable(
      renderDetailRow('Status', overdueLabel) +
        renderDetailRow('Pet', payload.petName) +
        renderDetailRow('Was due', payload.dueDate) +
        renderDetailRow('Category', payload.category),
    )}
    <p style="margin: 16px 0 0; font-size: 15px; line-height: 1.6; color: #6B6560;">
      Complete or reschedule when you can — small steps keep care on track.
    </p>`;

  const html = renderEmailLayout({
    preheader: `${payload.reminderTitle} is ${overdueLabel}`,
    title: 'Overdue care reminder',
    bodyHtml,
    ctaLabel: 'Take action',
    ctaUrl: payload.remindersUrl,
  });

  const text = [
    'Overdue care reminder',
    '',
    `${payload.reminderTitle} for ${payload.petName}`,
    `Status: ${overdueLabel}`,
    `Was due: ${payload.dueDate}`,
    '',
    `View reminders: ${payload.remindersUrl}`,
  ].join('\n');

  return { html, text };
}

function buildWeeklySummaryEmail(payload: WeeklySummaryPayload) {
  const petRows = payload.pets
    .map(
      (pet) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #E8E4DE;">
          <p style="margin: 0 0 6px; font-size: 16px; font-weight: 600; color: #2C2C2C;">${pet.name}</p>
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6B6560;">
            ${pet.upcomingCount} upcoming · ${pet.overdueCount} overdue
            ${
              pet.nextReminderTitle
                ? `<br />Next: ${pet.nextReminderTitle}${pet.nextReminderDue ? ` (${pet.nextReminderDue})` : ''}`
                : ''
            }
          </p>
        </td>
      </tr>`,
    )
    .join('');

  const bodyHtml = `
    <p style="margin: 0 0 8px; font-size: 16px; line-height: 1.6; color: #2C2C2C;">
      Hi ${payload.ownerName}, here is your pet care snapshot for ${payload.weekLabel}.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0; background: #FAF8F5; border-radius: 8px; overflow: hidden;">
      ${petRows || '<tr><td style="padding: 16px; color: #6B6560;">No pets with active reminders this week.</td></tr>'}
    </table>`;

  const html = renderEmailLayout({
    preheader: `Your weekly pet care summary — ${payload.weekLabel}`,
    title: 'Weekly pet summary',
    bodyHtml,
    ctaLabel: 'Open dashboard',
    ctaUrl: payload.dashboardUrl,
    footerNote:
      'Weekly summary emails respect your notification preferences. Adjust anytime in Settings.',
  });

  const text = [
    `Weekly pet summary — ${payload.weekLabel}`,
    '',
    ...payload.pets.map(
      (pet) =>
        `${pet.name}: ${pet.upcomingCount} upcoming, ${pet.overdueCount} overdue` +
        (pet.nextReminderTitle ? ` · Next: ${pet.nextReminderTitle}` : ''),
    ),
    '',
    `Dashboard: ${payload.dashboardUrl}`,
  ].join('\n');

  return { html, text };
}

function buildWelcomeEmail(payload: WelcomeEmailPayload) {
  const greeting = payload.ownerName ? `Hi ${payload.ownerName},` : 'Hi there,';
  const bodyHtml = `
    <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #2C2C2C;">
      ${greeting} welcome to PetClues.
    </p>
    <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #2C2C2C;">
      PetClues helps you organize pet records, reminders, documents, and care history in one calm place.
    </p>
    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #6B6560;">
      If you have not verified your email yet, check your inbox for the confirmation link from PetClues.
    </p>`;

  const html = renderEmailLayout({
    preheader: 'Welcome to PetClues — your pet care, organized.',
    title: 'Welcome to PetClues',
    bodyHtml,
    ctaLabel: 'Open your dashboard',
    ctaUrl: payload.dashboardUrl,
    footerNote: 'You received this because you created a PetClues account.',
  });

  const text = [
    'Welcome to PetClues',
    '',
    `${greeting} welcome to PetClues.`,
    'Organize pet records, reminders, documents, and care history in one calm place.',
    '',
    `Dashboard: ${payload.dashboardUrl}`,
    `Notification settings: ${payload.settingsUrl}`,
  ].join('\n');

  return { html, text };
}

function buildFoundingMemberEmail(payload: FoundingMemberConfirmationPayload) {
  const bodyHtml = `
    <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #2C2C2C;">
      You are on the PetClues founding list. Thank you for helping shape a calmer way to care for pets.
    </p>
    <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #2C2C2C;">
      When you create your account with the same email address, your Founding Member badge is applied automatically.
    </p>
    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #6B6560;">
      Early access and founding benefits roll out during the launch window.
    </p>`;

  const html = renderEmailLayout({
    preheader: 'You are on the PetClues founding list.',
    title: 'Founding member confirmed',
    bodyHtml,
    ctaLabel: 'Create your account',
    ctaUrl: payload.signupUrl,
    footerNote: 'You received this because you joined the PetClues founding list.',
  });

  const text = [
    'Founding member confirmed',
    '',
    'You are on the PetClues founding list.',
    'Create your account with the same email to receive your Founding Member badge.',
    '',
    `Sign up: ${payload.signupUrl}`,
    `Learn more: ${payload.dashboardUrl}`,
  ].join('\n');

  return { html, text };
}

function buildPremiumUpgradeEmail(payload: PremiumUpgradePayload) {
  const intervalLabel = payload.interval === 'yearly' ? 'yearly' : 'monthly';
  const greeting = payload.ownerName ? `Hi ${payload.ownerName},` : 'Hi there,';

  const bodyHtml = `
    <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #2C2C2C;">
      ${greeting} your PetClues Premium plan is active.
    </p>
    <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6; color: #2C2C2C;">
      You now have access to Premium features on your ${intervalLabel} plan, including expanded tools for records, reports, and document assistance.
    </p>
    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #6B6560;">
      Manage billing anytime from your account settings.
    </p>`;

  const html = renderEmailLayout({
    preheader: 'Your PetClues Premium plan is active.',
    title: 'Premium is active',
    bodyHtml,
    ctaLabel: 'Open dashboard',
    ctaUrl: payload.dashboardUrl,
    footerNote: 'You received this because your PetClues subscription was updated.',
  });

  const text = [
    'Premium is active',
    '',
    `${greeting} your PetClues Premium plan is active (${intervalLabel}).`,
    '',
    `Dashboard: ${payload.dashboardUrl}`,
    `Billing: ${payload.billingUrl}`,
  ].join('\n');

  return { html, text };
}

export function subjectForEmail(input: SendEmailInput): string {
  switch (input.type) {
    case 'upcoming_reminder':
      return `Upcoming: ${input.payload.reminderTitle} for ${input.payload.petName}`;
    case 'overdue_reminder':
      return `Overdue: ${input.payload.reminderTitle} for ${input.payload.petName}`;
    case 'weekly_pet_summary':
      return `Weekly pet summary — ${input.payload.weekLabel}`;
    case 'welcome':
      return 'Welcome to PetClues';
    case 'founding_member_confirmation':
      return 'You are on the PetClues founding list';
    case 'premium_upgrade':
      return 'Your PetClues Premium plan is active';
  }
}

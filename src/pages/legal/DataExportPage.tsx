import { LEGAL_EFFECTIVE_DATE, LEGAL_CONTACT } from '@/data/legalConfig';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
  LegalList,
  LegalComingSoon,
} from './LegalPageLayout';

export function DataExportPage() {
  return (
    <LegalPageLayout
      title="Export your data"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      eyebrow="Your data"
      intro={
        <LegalParagraph>
          You can request a copy of your account and pet data held in PetClues.
        </LegalParagraph>
      }
    >
      <LegalSection title="What can be exported">
        <LegalList
          items={[
            'Account profile',
            'Pet profiles',
            'Reminders',
            'Health records',
            'Document metadata',
            'Timeline entries',
            'Monthly reports',
            'Settings',
          ]}
        />
        <LegalParagraph>
          Exports are provided in a readable format where available. Some binary files may be
          delivered separately or as download links.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="How to request an export">
        <LegalParagraph>
          Email{' '}
          <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a> from your
          registered email address with the subject &quot;Data export request.&quot; We will verify
          your identity and respond with your export when ready.
        </LegalParagraph>
        <LegalComingSoon>
          One-click export from Settings is coming soon. Until then, contact support and we will
          prepare your export manually.
        </LegalComingSoon>
      </LegalSection>
    </LegalPageLayout>
  );
}

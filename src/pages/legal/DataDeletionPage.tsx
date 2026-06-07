import { LEGAL_EFFECTIVE_DATE, LEGAL_CONTACT } from '@/data/legalConfig';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
  LegalList,
  LegalComingSoon,
} from './LegalPageLayout';

export function DataDeletionPage() {
  return (
    <LegalPageLayout
      title="Delete your data"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      eyebrow="Your data"
      intro={
        <LegalParagraph>
          You can request deletion of your PetClues account and associated pet data.
        </LegalParagraph>
      }
    >
      <LegalSection title="What you can delete">
        <LegalParagraph>
          Account deletion removes your profile, pet records, reminders, documents, timeline
          entries, and related settings tied to your account, subject to the exceptions below.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="How to request deletion">
        <LegalParagraph>
          Email{' '}
          <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a> from the
          address associated with your account. Include your name and a clear request to delete
          your account and data. We may ask you to verify your identity before processing the
          request.
        </LegalParagraph>
        <LegalComingSoon>
          Self-service account deletion from Settings is coming soon. Until then, email support
          and we will process your request manually.
        </LegalComingSoon>
      </LegalSection>

      <LegalSection title="Retention exceptions">
        <LegalList
          items={[
            'Records we must keep to comply with law or respond to valid legal requests.',
            'Limited logs retained for security, fraud prevention, or abuse investigation.',
            'Aggregated or de-identified data that cannot reasonably be linked back to you.',
          ]}
        />
      </LegalSection>
    </LegalPageLayout>
  );
}

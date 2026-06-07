import { LEGAL_EFFECTIVE_DATE, LEGAL_CONTACT } from '@/data/legalConfig';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
  LegalList,
} from './LegalPageLayout';

export function SecurityPage() {
  return (
    <LegalPageLayout
      title="Security"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      eyebrow="Trust"
      intro={
        <LegalParagraph>
          We take the protection of your account and pet data seriously. This page describes our
          approach at a high level.
        </LegalParagraph>
      }
    >
      <LegalSection title="Account protection">
        <LegalParagraph>
          PetClues uses industry-standard authentication to verify your identity. Access to your
          account is limited to signed-in sessions protected by access controls.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Data protection">
        <LegalParagraph>
          Pet profiles, health records, documents, and timeline entries are stored with access
          controls so only your account (and collaborators you explicitly authorize, when
          available) can view them. Data is transmitted over encrypted connections in production
          environments.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Your role in security">
        <LegalList
          items={[
            'Use a strong, unique password for your PetClues account.',
            'Do not share login credentials with others.',
            'Sign out on shared or public devices.',
            'Report suspicious activity promptly.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Reporting concerns">
        <LegalParagraph>
          If you notice unusual account activity or have a security concern, contact{' '}
          <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a>. We review
          reports and take appropriate steps, but no system can guarantee absolute security.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}

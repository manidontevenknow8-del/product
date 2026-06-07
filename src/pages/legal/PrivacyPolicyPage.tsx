import { LEGAL_EFFECTIVE_DATE } from '@/data/legalConfig';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
  LegalList,
  LegalSubList,
  LegalContactBlock,
} from './LegalPageLayout';

export function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      intro={
        <LegalParagraph>
          PetClues respects your privacy. This Privacy Policy explains what information we collect,
          how we use it, how we share it, and the choices you have.
        </LegalParagraph>
      }
    >
      <LegalSection title="1. Information We Collect">
        <LegalSubList
          title="Account information"
          items={[
            'Name, email address, password hash or auth provider data.',
          ]}
        />
        <LegalSubList
          title="Pet information"
          items={[
            'Pet name, species, breed, age, photo, health details, reminders, documents, and timeline entries.',
          ]}
        />
        <LegalSubList
          title="Usage information"
          items={[
            'Pages visited, feature usage, device and browser info, and analytics events.',
          ]}
        />
        <LegalSubList
          title="Communication data"
          items={[
            'Support messages, email preferences, and feedback.',
          ]}
        />
        <LegalSubList
          title="Payment data"
          items={[
            'Billing status and subscription records, if applicable.',
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How We Use Information">
        <LegalList
          items={[
            'To create and manage accounts.',
            'To store pet profiles, records, documents, reminders, and reports.',
            'To provide product features including PetCare Score, monthly reports, referrals, and AI document extraction.',
            'To send account, security, and product emails.',
            'To improve the product, prevent abuse, and troubleshoot issues.',
            'To comply with legal obligations.',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. AI and Document Processing">
        <LegalParagraph>
          Uploaded pet documents may be processed by third-party AI services only to extract
          structured pet-care information. AI outputs are assistive and may be inaccurate. Please
          review AI-generated outputs before saving them to your pet&apos;s records.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. How We Share Information">
        <LegalList
          items={[
            'With service providers that help run PetClues, such as authentication, hosting, storage, email delivery, analytics, and AI processing.',
            'When required by law.',
            'With your consent, or when you share your own pet data.',
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <LegalParagraph>
          We keep data while your account is active and as needed to provide the service. You may
          delete your account and data unless legal or operational retention is required.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="6. Your Rights and Choices">
        <LegalList
          items={[
            'Access your personal and pet data.',
            'Correct inaccurate information.',
            'Request deletion of your account and data.',
            'Request an export of your data.',
            'Manage marketing email preferences.',
            'Use cookie controls where applicable.',
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Security">
        <LegalParagraph>
          PetClues uses reasonable administrative, technical, and organizational safeguards to
          protect your information. No method of storage or transmission is completely secure, and
          we cannot guarantee absolute security.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="8. Children&apos;s Privacy">
        <LegalParagraph>
          PetClues is intended for adults or responsible users managing pet data. It is not
          directed at children.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Contact Us">
        <LegalContactBlock />
      </LegalSection>

      <LegalParagraph>
        By using PetClues, you agree to this Privacy Policy.
      </LegalParagraph>
    </LegalPageLayout>
  );
}

import { LEGAL_EFFECTIVE_DATE } from '@/data/legalConfig';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
  LegalList,
  LegalContactBlock,
} from './LegalPageLayout';

export function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      intro={
        <LegalParagraph>These Terms of Service govern your use of PetClues.</LegalParagraph>
      }
    >
      <LegalSection title="1. Acceptance of Terms">
        <LegalParagraph>
          By accessing or using PetClues, you agree to these Terms of Service. If you do not agree,
          please do not use the service.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Eligibility and Account Responsibility">
        <LegalParagraph>
          You must be able to form a binding contract to use PetClues. You are responsible for
          maintaining the security of your account credentials and for activity that occurs under
          your account.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="3. Your Pet Data">
        <LegalParagraph>
          You retain ownership of the pet information and documents you add to PetClues. You grant
          PetClues a limited license to store, process, and display that information solely to
          provide the service. You are responsible for the accuracy of the information you enter.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Subscription and Billing">
        <LegalParagraph>
          PetClues offers free and premium plans. Free plans include core organization features for
          limited use. Premium plans may include additional features such as expanded pet profiles,
          advanced reports, and AI-assisted document tools.
        </LegalParagraph>
        <LegalParagraph>
          Premium access is billed annually through Razorpay. Pricing and plan details are shown on
          our pricing page and may change with notice. Memberships renew each year unless canceled
          before the renewal date.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="5. Acceptable Use">
        <LegalList
          items={[
            'Do not use PetClues for unlawful purposes.',
            'Do not abuse, scrape, reverse engineer, or interfere with the service.',
            'Do not attempt to access another user\'s account or data without permission.',
            'Do not upload harmful code or content that violates others\' rights.',
          ]}
        />
      </LegalSection>

      <LegalSection title="6. PetClues Is Not Veterinary Advice">
        <LegalParagraph>
          PetClues is an organizational and informational tool. It is not a veterinarian, emergency
          service, or medical provider.
        </LegalParagraph>
        <LegalParagraph>
          Always consult a licensed veterinarian for diagnosis, treatment, and urgent medical
          decisions.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="7. AI Features">
        <LegalParagraph>
          AI outputs are generated suggestions only. You must review outputs before relying on them.
          PetClues is not responsible for decisions made based on automated suggestions that have
          not been verified.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="8. Ownership and License">
        <LegalParagraph>
          PetClues and its branding, software, and design are owned by PetClues or its licensors.
          We grant you a personal, non-exclusive license to use the service according to these
          Terms.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Third-Party Services">
        <LegalParagraph>
          PetClues may integrate with third-party services for authentication, hosting, analytics,
          email, payments, and AI processing. Your use of those services may be subject to their
          own terms and policies.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="10. Suspension and Termination">
        <LegalParagraph>
          We may suspend or terminate access if you violate these Terms or if required for security
          or legal reasons. You may stop using PetClues at any time and request account deletion.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="11. Disclaimers">
        <LegalParagraph>
          PetClues is provided on an &quot;as is&quot; and &quot;as available&quot; basis without
          warranties of any kind, whether express or implied, to the fullest extent permitted by
          law.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="12. Limitation of Liability">
        <LegalParagraph>
          To the maximum extent permitted by law, PetClues and its affiliates will not be liable
          for indirect, incidental, special, consequential, or punitive damages, or any loss of
          data, profits, or goodwill, arising from your use of the service.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="13. Changes to the Service">
        <LegalParagraph>
          We may update features, plans, or these Terms from time to time. Material changes will be
          communicated through the product or by email where appropriate. Continued use after
          changes take effect constitutes acceptance of the updated Terms.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="14. Contact">
        <LegalContactBlock />
      </LegalSection>
    </LegalPageLayout>
  );
}

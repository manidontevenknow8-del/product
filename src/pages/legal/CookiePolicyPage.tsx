import { LEGAL_EFFECTIVE_DATE, LEGAL_CONTACT } from '@/data/legalConfig';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
  LegalList,
  LegalComingSoon,
} from './LegalPageLayout';

export function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      intro={
        <LegalParagraph>
          This Cookie Policy explains how PetClues uses cookies and similar technologies when you
          visit or use our website and app.
        </LegalParagraph>
      }
    >
      <LegalSection title="What are cookies?">
        <LegalParagraph>
          Cookies are small text files stored on your device when you visit a website. Similar
          technologies, such as local storage and session storage, help us remember your
          preferences and keep you signed in.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="How we use cookies">
        <LegalList
          items={[
            'Login and security: to keep your session secure and authenticate your account.',
            'Preferences: to remember settings such as notification choices.',
            'Analytics: to understand how features are used and improve the product.',
            'Product improvement: to measure performance and troubleshoot issues.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Cookie controls">
        <LegalParagraph>
          You can control cookies through your browser settings. Disabling essential cookies may
          affect your ability to sign in or use core features.
        </LegalParagraph>
        <LegalComingSoon>
          A dedicated cookie preference center is coming soon for regions where consent is
          required. Until then, you may adjust browser settings or contact us with questions.
        </LegalComingSoon>
      </LegalSection>

      <LegalSection title="Third-party services">
        <LegalParagraph>
          We may use analytics and infrastructure providers that set their own cookies or similar
          identifiers. Each provider&apos;s policies apply when their services are active.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Contact">
        <LegalParagraph>
          Questions about cookies? Email{' '}
          <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a>.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}

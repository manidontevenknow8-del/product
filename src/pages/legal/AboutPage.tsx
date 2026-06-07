import { LEGAL_EFFECTIVE_DATE } from '@/data/legalConfig';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
} from './LegalPageLayout';

export function AboutPage() {
  return (
    <LegalPageLayout
      title="About PetClues"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      eyebrow="About"
      intro={
        <LegalParagraph>
          PetClues exists to help pet owners stay organized — calmly, clearly, and in one place.
        </LegalParagraph>
      }
    >
      <LegalSection title="Why we built PetClues">
        <LegalParagraph>
          Pet parents juggle vaccination schedules, vet visits, medications, insurance paperwork,
          and everyday care notes. Records get lost in email threads. Reminders live on sticky
          notes. Important documents sit in camera rolls or drawers.
        </LegalParagraph>
        <LegalParagraph>
          PetClues was created for that everyday friction: to help you remember records, health
          information, reminders, and the documents that matter when you need them.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="What PetClues does">
        <LegalParagraph>
          PetClues is an organizational tool for pet care. It brings profiles, timelines, reminders,
          documents, and reports together so you can see your pet&apos;s care story at a glance.
        </LegalParagraph>
        <LegalParagraph>
          It does not replace your veterinarian. It helps you keep information handy, stay on
          schedule, and share what matters with the people who help care for your pet.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="Our approach">
        <LegalParagraph>
          We believe pet care tools should feel calm and premium — not cluttered or clinical. We
          focus on clarity, thoughtful design, and features that respect the trust you place in us
          with your pet&apos;s information.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}

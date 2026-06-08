import { LEGAL_EFFECTIVE_DATE, LEGAL_CONTACT } from '@/data/legalConfig';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
} from './LegalPageLayout';
import styles from './LegalPage.module.css';

const FAQ_ITEMS = [
  {
    question: 'What is PetClues?',
    answer:
      'PetClues is an organizational tool for pet care. It helps you store pet profiles, health records, reminders, documents, and care history in one calm, premium experience.',
  },
  {
    question: 'Is PetClues veterinary advice?',
    answer:
      'No. PetClues is not veterinary advice and does not diagnose, treat, or replace a veterinarian. Always consult a licensed veterinarian for medical decisions.',
  },
  {
    question: 'How do AI document features work?',
    answer:
      'When you upload a document, AI may suggest structured fields to save time. Suggestions are assistive and may be inaccurate - review everything before saving.',
  },
  {
    question: 'How do I delete my account or export my data?',
    answer:
      `Visit our Data Deletion and Export Data pages for instructions. Email ${LEGAL_CONTACT.support} and we will help you manually until self-service options are available.`,
  },
  {
    question: 'Is PetClues free?',
    answer:
      'PetClues offers a free plan with core organization features. Premium plans with additional capabilities are described on the pricing page. Online billing is coming soon.',
  },
  {
    question: 'How do I contact support?',
    answer:
      `Email ${LEGAL_CONTACT.support} or use our contact page. Response times may vary.`,
  },
];

export function FaqPage() {
  return (
    <LegalPageLayout
      title="Frequently asked questions"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      eyebrow="Help"
      intro={
        <LegalParagraph>
          Answers to common questions about PetClues. For anything else, reach us at{' '}
          <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a>.
        </LegalParagraph>
      }
    >
      <LegalSection title="Questions">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question} className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>{item.question}</h3>
            <LegalParagraph>{item.answer}</LegalParagraph>
          </div>
        ))}
      </LegalSection>
    </LegalPageLayout>
  );
}

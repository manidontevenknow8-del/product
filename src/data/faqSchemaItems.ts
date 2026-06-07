/** FAQ content used for /faq JSON-LD (matches FaqPage copy). */
export const FAQ_PAGE_SCHEMA_ITEMS = [
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
      'When you upload a document, AI may suggest structured fields to save time. Suggestions are assistive and may be inaccurate — review everything before saving.',
  },
  {
    question: 'How do I delete my account or export my data?',
    answer:
      'Visit our Data Deletion and Export Data pages for instructions. Email support@petclues.com and we will help you manually until self-service options are available.',
  },
  {
    question: 'Is PetClues free?',
    answer:
      'PetClues offers a free plan with core organization features. Premium plans with additional capabilities are described on the pricing page. Online billing is coming soon.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'Email support@petclues.com or use our contact page. Response times may vary.',
  },
] as const;

/** Landing-page FAQ schema (product-focused, indexable homepage). */
export const LANDING_FAQ_SCHEMA_ITEMS = [
  {
    question: 'What is PetClues?',
    answer:
      'PetClues is a pet health records app that helps dog and cat parents organize medical records, set vaccination and medication reminders, log daily check-ins, and share an emergency pet passport.',
  },
  {
    question: 'Is PetClues free?',
    answer:
      'Yes. PetClues offers a free plan for one pet with health records, reminders, daily check-ins, emergency passport, and monthly report viewing. Premium adds unlimited pets, Vet Bill Decoder AI, and report exports.',
  },
  {
    question: 'Can PetClues send pet vaccination reminders?',
    answer:
      'Yes. PetClues sends in-app and email reminders for vaccinations, medications, and vet visits — with alerts before due dates.',
  },
  {
    question: 'How do I organize pet medical records online?',
    answer:
      'Upload vet bills, lab results, and vaccination certificates to the PetClues document vault. Records appear on your pet health timeline and can trigger care reminders.',
  },
] as const;

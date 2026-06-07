import { useState } from 'react';
import type { FormEvent } from 'react';
import { LEGAL_CONTACT } from '@/data/legalConfig';
import { INPUT_LIMITS, trimField, validateEmail, validateRequiredText } from '@/utils/inputValidation';
import { Button, Input } from '@/components/ui';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
  LegalContactBlock,
} from './LegalPageLayout';
import styles from './LegalPage.module.css';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const safeName = trimField(name, INPUT_LIMITS.name);
    const safeEmail = trimField(email, INPUT_LIMITS.email);
    const safeMessage = trimField(message, INPUT_LIMITS.message);
    const nameError = validateRequiredText(safeName, 'Name', INPUT_LIMITS.name);
    const emailError = validateEmail(safeEmail);
    const messageError = validateRequiredText(safeMessage, 'Message', INPUT_LIMITS.message);
    if (nameError || emailError || messageError) return;

    const subject = encodeURIComponent('PetClues support request');
    const body = encodeURIComponent(
      `Name: ${safeName}\nEmail: ${safeEmail}\n\n${safeMessage}`,
    );
    window.location.href = `mailto:${LEGAL_CONTACT.support}?subject=${subject}&body=${body}`;
  }

  return (
    <LegalPageLayout
      title="Talk to PetClues"
      effectiveDate=""
      eyebrow="Contact"
      intro={
        <LegalParagraph>
          We&apos;re here to help with account questions, feedback, and data requests. Response
          times may vary depending on volume.
        </LegalParagraph>
      }
      showHealthDisclaimer={false}
    >
      <LegalSection title="Reach us directly">
        <LegalContactBlock />
      </LegalSection>

      <LegalSection title="Send a message">
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <Input
            label="Your name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={INPUT_LIMITS.name}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={INPUT_LIMITS.email}
            required
          />
          <Input
            as="textarea"
            label="Message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={INPUT_LIMITS.message}
            rows={5}
            required
          />
          <Button type="submit" variant="primary">
            Open in your email app
          </Button>
        </form>
        <LegalParagraph>
          Submitting opens your default email client addressed to{' '}
          {LEGAL_CONTACT.support}. For legal matters, contact{' '}
          <a href={`mailto:${LEGAL_CONTACT.legal}`}>{LEGAL_CONTACT.legal}</a>.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  );
}

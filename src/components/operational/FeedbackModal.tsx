import { useEffect, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Input, Textarea } from '@/components/ui';
import { useAnalytics } from '@/analytics';
import {
  mockFeedbackService,
  FEEDBACK_TYPE_LABELS,
} from '@/services/feedback/feedbackService';
import type { FeedbackType } from '@/types/feedback';
import styles from './FeedbackModal.module.css';

type FeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: FeedbackType;
};

export function FeedbackModal({
  isOpen,
  onClose,
  defaultType = 'general',
}: FeedbackModalProps) {
  const { track } = useAnalytics();
  const location = useLocation();
  const [type, setType] = useState<FeedbackType>(defaultType);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setMessage('');
      setSubmitted(false);
    }
  }, [isOpen, defaultType]);

  useEffect(() => {
    if (!isOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    await mockFeedbackService.submit({
      type,
      message: message.trim(),
      email: email.trim() || undefined,
      page: location.pathname,
    });
    track('feedback_submitted', { type, page: location.pathname });
    setLoading(false);
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="feedback-title"
      >
        {submitted ? (
          <div className={styles.success}>
            <h2 className={styles.successTitle}>Thank you</h2>
            <p className={styles.successMsg}>
              Your feedback helps us build a better PetClues.
            </p>
          </div>
        ) : (
          <>
            <h2 id="feedback-title" className={styles.title}>
              Beta feedback
            </h2>
            <p className={styles.subtitle}>
              Help us improve PetClues during the beta. Report issues or suggest features.
            </p>

            <div className={styles.types} role="group" aria-label="Feedback type">
              {(Object.keys(FEEDBACK_TYPE_LABELS) as FeedbackType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.typeBtn} ${type === t ? styles.typeBtnActive : ''}`}
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                >
                  {FEEDBACK_TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <Textarea
                label="Your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what happened or what you'd like to see…"
                required
              />
              <Input
                label="Email (optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <div className={styles.actions}>
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Sending…' : 'Send feedback'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

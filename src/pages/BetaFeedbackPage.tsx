import { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageContainer, SectionHeader, Button } from '@/components/ui';
import { FeedbackModal } from '@/components/operational';
import styles from './BetaFeedbackPage.module.css';

export function BetaFeedbackPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'bug' | 'feature' | 'general'>('general');

  const open = (type: 'bug' | 'feature' | 'general') => {
    setModalType(type);
    setModalOpen(true);
  };

  return (
    <AppLayout>
      <PageContainer size="md" className={styles.page}>
        <SectionHeader
          title="Beta feedback"
          subtitle="You're helping shape PetClues. Every report makes the product better."
        />

        <div className={styles.cards}>
          <button type="button" className={styles.card} onClick={() => open('bug')}>
            <span className={styles.cardTitle}>Report an issue</span>
            <span className={styles.cardDesc}>
              Something not working? Tell us what happened.
            </span>
          </button>
          <button type="button" className={styles.card} onClick={() => open('feature')}>
            <span className={styles.cardTitle}>Request a feature</span>
            <span className={styles.cardDesc}>
              Share an idea that would improve your pet care workflow.
            </span>
          </button>
          <button type="button" className={styles.card} onClick={() => open('general')}>
            <span className={styles.cardTitle}>General feedback</span>
            <span className={styles.cardDesc}>
              Share your overall experience during the beta.
            </span>
          </button>
        </div>

        <Button variant="primary" onClick={() => open('general')}>
          Open feedback form
        </Button>

        <FeedbackModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          defaultType={modalType}
        />
      </PageContainer>
    </AppLayout>
  );
}

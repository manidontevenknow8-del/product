import { Link } from 'react-router-dom';
import { PET_MATCH_SIGNUP_PATH } from '@/data/petMatchEditorialQuiz';
import { savePendingPetMatch } from '@/data/petMatchStorage';
import { ROUTES } from '@/routes/paths';
import styles from './PetMatchSaveMatchesPanel.module.css';

const EDITORIAL_IMAGE_URL =
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80';

type PetMatchSaveMatchesPanelProps = {
  isAuthenticated: boolean;
  topMatchBreed?: string;
  onSave?: () => void;
  saveSuccess?: boolean;
};

function EditorialVisual() {
  return (
    <div className={styles.visual} aria-hidden>
      <img src={EDITORIAL_IMAGE_URL} alt="" className={styles.visualImg} />
      <div className={styles.visualScrim} />
    </div>
  );
}

export function PetMatchSaveMatchesPanel({
  isAuthenticated,
  topMatchBreed,
  onSave,
  saveSuccess = false,
}: PetMatchSaveMatchesPanelProps) {
  if (isAuthenticated) {
    return (
      <div className={styles.card}>
        <div className={styles.body}>
          <EditorialVisual />
          <div className={styles.copy}>
            <h3 className={styles.title}>Matches saved to your account</h3>
            <p className={styles.description}>
              When you&apos;re ready, start their digital journal - vaccines, vet visits, and
              milestones in one calm place.
            </p>
            <div className={styles.actions}>
              <Link to={ROUTES.ONBOARDING} className={styles.ctaPrimary}>
                Start their journal
              </Link>
              <Link to={ROUTES.DASHBOARD} className={styles.ctaSecondary}>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <EditorialVisual />
        <div className={styles.copy}>
          <p className={styles.eyebrow}>PetClues · Free</p>
          <h3 className={styles.title}>Save Your Matches</h3>
          <p className={styles.description}>
            Create your free PetClues account to save these recommendations and prepare the perfect
            digital journal for your future companion.
          </p>
          <Link
            to={PET_MATCH_SIGNUP_PATH}
            onClick={() => {
              if (topMatchBreed) savePendingPetMatch(topMatchBreed);
            }}
            className={styles.ctaPrimaryFull}
          >
            Create Free Account
          </Link>
          {onSave && (
            <p className={styles.hint}>
              Results cannot be emailed or downloaded without an account.
            </p>
          )}
          {saveSuccess && (
            <p className={styles.status} role="status">
              Saved locally - create an account to keep them permanently.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

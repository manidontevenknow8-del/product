import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ROUTES } from '@/routes/paths';
import styles from './PetMatchLeadCapture.module.css';

type PetMatchLeadCaptureProps = {
  isAuthenticated: boolean;
  onSave: () => void;
  onRestart: () => void;
  saveSuccess: boolean;
};

export function PetMatchLeadCapture({
  isAuthenticated,
  onSave,
  onRestart,
  saveSuccess,
}: PetMatchLeadCaptureProps) {
  return (
    <Card variant="elevated" className={styles.card}>
      <h3 className={styles.title}>What happens after you find the one</h3>
      <p className={styles.subtitle}>
        The match is only the beginning. PetClues helps you keep vaccines, vet visits, medications,
        and memories in one calm place - so the life you imagined does not dissolve into scattered
        notes and forgotten dates.
      </p>

      <div className={styles.actions}>
        <Button variant="primary" onClick={onSave}>
          {saveSuccess ? 'Saved' : 'Save this match'}
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          Retake quiz
        </Button>
      </div>

      <div className={styles.nextSteps}>
        {isAuthenticated ? (
          <>
            <p className={styles.nextLead}>Ready to build their home in PetClues?</p>
            <div className={styles.nextActions}>
              <Link to={ROUTES.PET_PROFILE}>
                <Button variant="secondary">Set up pet profile</Button>
              </Link>
              <Link to={ROUTES.DASHBOARD}>
                <Button variant="ghost">Go to dashboard</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className={styles.nextLead}>
              Create a free account to save this match and start organizing their health story from
              day one.
            </p>
            <div className={styles.nextActions}>
              <Link to={ROUTES.SIGNUP}>
                <Button variant="secondary">Create free account</Button>
              </Link>
              <Link to={ROUTES.ABOUT}>
                <Button variant="ghost">Why PetClues exists</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

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
      <h3 className={styles.title}>Keep your perfect match</h3>
      <p className={styles.subtitle}>
        Save this recommendation so you can compare options and return later.
      </p>

      <div className={styles.actions}>
        <Button variant="primary" onClick={onSave}>
          {saveSuccess ? 'Saved' : 'Save recommendation'}
        </Button>
        <Button variant="ghost" onClick={onRestart}>
          Start again
        </Button>
      </div>

      {!isAuthenticated && (
        <div className={styles.cta}>
          <p className={styles.ctaText}>
            Create an account before leaving to keep your pet match synced across devices.
          </p>
          <Link to={ROUTES.SIGNUP}>
            <Button variant="secondary">Create account</Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

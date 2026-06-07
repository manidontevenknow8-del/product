import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import styles from './HealthDisclaimerNote.module.css';

type HealthDisclaimerNoteProps = {
  compact?: boolean;
};

/** Inline trust note for health-adjacent app pages (not a substitute for legal pages). */
export function HealthDisclaimerNote({ compact = false }: HealthDisclaimerNoteProps) {
  return (
    <p
      className={compact ? styles.compact : styles.note}
      role="note"
    >
      {HEALTH_DISCLAIMER}
    </p>
  );
}

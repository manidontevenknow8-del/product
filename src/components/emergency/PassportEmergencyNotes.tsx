import { Button } from '@/components/ui';
import { PASSPORT_IMG, passportImageUrl } from '@/data/passportImages';
import styles from './PassportEmergencyNotes.module.css';

type PassportEmergencyNotesProps = {
  notes: string;
  onAddWellnessNote?: () => void;
};

export function PassportEmergencyNotes({ notes, onAddWellnessNote }: PassportEmergencyNotesProps) {
  const isEmpty = notes === 'No emergency notes recorded.';

  return (
    <section className={styles.card} aria-labelledby="passport-emergency-notes">
      <div className={styles.cardInner}>
        <div className={styles.thumb}>
          <img
            src={passportImageUrl(PASSPORT_IMG.emergencyNotes)}
            alt=""
            className={styles.thumbImg}
            loading="lazy"
            aria-hidden
          />
        </div>
        <div className={styles.body}>
          <div className={styles.head}>
            <h2 id="passport-emergency-notes" className={styles.title}>
              Emergency notes
              <span className={styles.badge}>Critical</span>
            </h2>
            {onAddWellnessNote && (
              <Button variant="secondary" size="sm" type="button" onClick={onAddWellnessNote}>
                Add note
              </Button>
            )}
          </div>
          <p className={styles.hint}>
            Compiled from wellness and high-priority health records on file. Add a wellness record
            with notes to update this section.
          </p>
          <p className={`${styles.notes} ${isEmpty ? styles.notesEmpty : ''}`}>{notes}</p>
        </div>
      </div>
    </section>
  );
}

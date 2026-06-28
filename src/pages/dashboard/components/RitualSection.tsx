import { RitualCheckIn } from './RitualCheckIn';
import styles from '../../DashboardPage.module.css';

type RitualSectionProps = {
  petName: string;
};

export function RitualSection({ petName }: RitualSectionProps) {
  return (
    <section id="ritual" className={styles.chapterRitual} aria-labelledby="chapter-checkin">
      <div className={styles.chapterInner}>
        <RitualCheckIn petName={petName} />
      </div>
    </section>
  );
}

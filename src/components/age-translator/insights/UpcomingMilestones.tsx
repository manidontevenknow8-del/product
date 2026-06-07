import type { Milestone } from '@/types/ageTranslator';
import styles from './UpcomingMilestones.module.css';

const typeIcons: Record<Milestone['type'], string> = {
  birthday: '★',
  life_stage: '◆',
  vaccine: '●',
  preventative: '○',
};

type UpcomingMilestonesProps = {
  milestones: Milestone[];
};

export function UpcomingMilestones({ milestones }: UpcomingMilestonesProps) {
  return (
    <section className={styles.section} aria-label="Upcoming milestones">
      <h2 className={styles.title}>Upcoming milestones</h2>
      <div className={styles.list}>
        {milestones.map((milestone) => (
          <article key={milestone.id} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              {typeIcons[milestone.type]}
            </span>
            <div className={styles.content}>
              <h3 className={styles.itemTitle}>{milestone.title}</h3>
              <p className={styles.itemDesc}>{milestone.description}</p>
            </div>
            <span className={styles.eta}>{milestone.eta}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

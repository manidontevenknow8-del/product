import { Link } from 'react-router-dom';
import type { DashboardNextTask } from '@/services/dashboard/dashboardNextTask';
import styles from '../../DashboardPage.module.css';

const URGENCY_CLASS: Record<DashboardNextTask['urgency'], string> = {
  overdue: styles.attentionOverdue,
  today: styles.attentionToday,
  soon: styles.attentionSoon,
  setup: styles.attentionSetup,
  calm: styles.attentionCalm,
};

type AttentionNowProps = {
  petName: string;
  task: DashboardNextTask;
};

export function AttentionNow({ petName, task }: AttentionNowProps) {
  return (
    <section className={styles.attention} aria-labelledby="attention-heading">
      <div className={styles.attentionInner}>
        <div className={styles.attentionCopy}>
          <p className={styles.sectionEyebrow} id="attention-heading">
            What needs attention
          </p>
          <h2 className={styles.attentionTitle}>
            {task.isPositive ? `${petName} is in a calm stretch` : task.title}
          </h2>
          <p className={styles.attentionDesc}>{task.description}</p>
          {task.dueLabel && !task.isPositive && (
            <p className={`${styles.attentionDue} ${URGENCY_CLASS[task.urgency]}`}>{task.dueLabel}</p>
          )}
        </div>
        <Link to={task.ctaPath} className={styles.attentionCta}>
          {task.ctaLabel}
        </Link>
      </div>
    </section>
  );
}

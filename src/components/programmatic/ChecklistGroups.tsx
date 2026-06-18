import type { ProgrammaticChecklistGroup } from '@/types/programmaticPage';
import styles from './ProgrammaticSections.module.css';

type ChecklistGroupsProps = {
  groups: ProgrammaticChecklistGroup[];
};

export function ChecklistGroups({ groups }: ChecklistGroupsProps) {
  return (
    <div className={styles.checklistGrid}>
      {groups.map((group) => (
        <section key={group.title} className={styles.checklistCard} aria-labelledby={group.title.replace(/\s+/g, '-')}>
          <h3 id={group.title.replace(/\s+/g, '-')} className={styles.checklistTitle}>
            {group.title}
          </h3>
          <ul className={styles.checklistList}>
            {group.items.map((item) => (
              <li key={item}>
                <span className={styles.checkbox} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

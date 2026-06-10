import { usePets } from '@/pets';
import type { ReminderFilters as ReminderFiltersState, ReminderView } from '@/types/reminder';
import {
  REMINDER_CATEGORIES,
  categoryLabels,
  viewLabels,
} from '@/types/reminder';
import type { ReminderStats } from '@/types/reminder';
import styles from './ReminderFilters.module.css';

const views: ReminderView[] = ['list', 'upcoming', 'overdue', 'calendar'];

type ReminderFiltersProps = {
  filters: ReminderFiltersState;
  stats: ReminderStats;
  onChange: (filters: ReminderFiltersState) => void;
};

export function ReminderFilters({ filters, stats, onChange }: ReminderFiltersProps) {
  const { pets } = usePets();
  const setView = (view: ReminderView) => onChange({ ...filters, view });

  return (
    <div className={styles.filters}>
      <nav className={styles.viewTabs} aria-label="Reminder views">
        {views.map((view) => (
          <button
            key={view}
            type="button"
            className={`${styles.viewTab} ${filters.view === view ? styles.viewTabActive : ''}`}
            onClick={() => setView(view)}
          >
            {viewLabels[view]}
          </button>
        ))}
      </nav>

      <div className={styles.secondary}>
        {pets.length > 1 && (
          <select
            className={styles.select}
            value={filters.petId}
            onChange={(e) =>
              onChange({
                ...filters,
                petId: e.target.value,
              })
            }
            aria-label="Filter by pet"
          >
            <option value="all">All pets</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        )}

        <select
          className={styles.select}
          value={filters.category}
          onChange={(e) =>
            onChange({
              ...filters,
              category: e.target.value as ReminderFiltersState['category'],
            })
          }
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {REMINDER_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat]}
            </option>
          ))}
        </select>

        <div className={styles.counts}>
          <span className={styles.count}>
            Upcoming: <span className={styles.countValue}>{stats.upcoming + stats.dueToday}</span>
          </span>
          <span className={`${styles.count} ${styles.countOverdue}`}>
            Overdue: <span className={styles.countValue}>{stats.overdue}</span>
          </span>
          <span className={styles.count}>
            Completed: <span className={styles.countValue}>{stats.completed}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

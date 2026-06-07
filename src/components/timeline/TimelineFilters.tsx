import {
  filterLabels,
  countEventsForFilter,
  type TimelineFilter,
  type TimelineEventItem,
} from '@/types/timeline';
import styles from './TimelineFilters.module.css';

const filters: TimelineFilter[] = [
  'all',
  'care',
  'memory',
  'documents',
  'milestones',
];

type TimelineFiltersProps = {
  activeFilter: TimelineFilter;
  onFilterChange: (filter: TimelineFilter) => void;
  events: TimelineEventItem[];
};

export function TimelineFilters({
  activeFilter,
  onFilterChange,
  events,
}: TimelineFiltersProps) {
  return (
    <nav className={styles.filters} aria-label="Timeline filters">
      {filters.map((filter) => {
        const count = countEventsForFilter(events, filter);
        return (
          <button
            key={filter}
            type="button"
            className={`${styles.filterBtn} ${
              activeFilter === filter ? styles.filterBtnActive : ''
            }`}
            onClick={() => onFilterChange(filter)}
          >
            <span>{filterLabels[filter]}</span>
            <span className={styles.count}>{count}</span>
          </button>
        );
      })}
    </nav>
  );
}

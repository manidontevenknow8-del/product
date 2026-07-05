import { TimelineEventCard } from './TimelineEventCard';
import { MilestoneCard } from './MilestoneCard';
import { LifeStorySummary } from './LifeStorySummary';
import { EmptyTimelineState } from './EmptyTimelineState';
import { groupEventsByMonth } from '@/data/timelineData';
import { filterLabels, type TimelineFilter } from '@/types/timeline';
import type { TimelineEventItem, Milestone, LifeStorySummary as LifeStorySummaryData } from '@/types/timeline';
import styles from './TimelineFeed.module.css';

type TimelineFeedProps = {
  events: TimelineEventItem[];
  milestones: Milestone[];
  petName: string;
  storySummary: LifeStorySummaryData;
  showMilestones?: boolean;
  milestonesAccessNote?: string;
  filteredEmpty?: boolean;
  activeFilter?: TimelineFilter;
  onAddMoment?: () => void;
};

function parseMonthGroup(month: string): { monthName: string; year: string } {
  const parts = month.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { monthName: parts.slice(0, -1).join(' '), year: parts[parts.length - 1] };
  }
  return { monthName: month, year: '' };
}

function FilteredEmptyLuxury({
  petName,
  filter,
  onAddMoment,
}: {
  petName: string;
  filter: TimelineFilter;
  onAddMoment?: () => void;
}) {
  const label = filter === 'all' ? 'moments' : filterLabels[filter].toLowerCase();
  const lead =
    filter === 'memory'
      ? `Save a photo and caption with Add moment — hand-picked memories show here alongside vault photos and welcome-home chapters.`
      : `Every moment you log becomes part of ${petName}'s story.`;

  return (
    <div className={styles.filteredEmpty}>
      <p className={styles.filteredGhost} aria-hidden>
        —
      </p>
      <p className={styles.filteredTitle}>No {label} moments yet</p>
      <p className={styles.filteredLead}>{lead}</p>
      {onAddMoment && (
        <button type="button" className={styles.filteredAction} onClick={onAddMoment}>
          + Add first moment
        </button>
      )}
    </div>
  );
}

export function TimelineFeed({
  events,
  milestones,
  petName,
  storySummary,
  showMilestones = true,
  milestonesAccessNote,
  filteredEmpty = false,
  activeFilter = 'all',
  onAddMoment,
}: TimelineFeedProps) {
  const groups = groupEventsByMonth(events);

  if (filteredEmpty) {
    return (
      <FilteredEmptyLuxury
        petName={petName}
        filter={activeFilter}
        onAddMoment={onAddMoment}
      />
    );
  }

  if (events.length === 0) {
    return <EmptyTimelineState petName={petName} filtered />;
  }

  const petInitial = petName.charAt(0);

  return (
    <div className={styles.feed}>
      <LifeStorySummary summary={storySummary} />

      {showMilestones && milestones.length > 0 && (
        <section className={styles.milestonesBleed} data-reveal aria-labelledby="timeline-milestones">
          <div className={styles.milestonesInner}>
            <header className={styles.milestonesHead}>
              <div>
                <p className={styles.milestonesKicker}>Featured chapter</p>
                <h2 id="timeline-milestones" className={styles.milestonesTitle}>
                  Milestone moments
                </h2>
                <p className={styles.milestonesLead}>
                  {milestonesAccessNote ??
                    `The turning points that define ${petName}'s story — highlighted with care.`}
                </p>
              </div>
              <span className={styles.milestonesCount}>
                {milestones.length} preserved
              </span>
            </header>
            <div className={styles.milestonesGrid}>
              {milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  petInitial={petInitial}
                />
              ))}
            </div>
            <a href="#timeline-chronology" className={styles.seeAll}>
              Continue to full chronology ↓
            </a>
          </div>
        </section>
      )}

      <div className={styles.timeline} id="timeline-chronology">
        <header className={styles.chronologyIntro}>
          <p className={styles.chronologyKicker}>The chronology</p>
          <h2 className={styles.chronologyTitle}>Month by month</h2>
        </header>
        {groups.map((group) => {
          const { monthName, year } = parseMonthGroup(group.month);
          return (
            <section key={group.month} className={styles.monthGroup} data-reveal="soft" aria-label={group.month}>
              <div className={styles.monthHeader}>
                <div className={styles.monthHeading}>
                  <h3 className={styles.monthLabel}>{monthName}</h3>
                  {year && <span className={styles.monthYear}>{year}</span>}
                </div>
                <div className={styles.monthLine} aria-hidden />
                <span className={styles.monthCount}>
                  {group.events.length} {group.events.length === 1 ? 'moment' : 'moments'}
                </span>
              </div>

              <div className={styles.monthEvents}>
                {group.events.map((event, index) => (
                  <div
                    key={event.id}
                    className={`${styles.eventWrap} ${index % 2 === 1 ? styles.eventWrapAlt : ''}`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className={styles.beadOuter} aria-hidden="true">
                      <div className={styles.beadInner} />
                    </div>
                    <TimelineEventCard
                      event={event}
                      featured={
                        index === 0 &&
                        (event.type === 'adoption' || event.type === 'manual_moment')
                      }
                      petName={petName}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

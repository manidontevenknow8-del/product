import { TimelineEventCard } from './TimelineEventCard';
import { MilestoneCard } from './MilestoneCard';
import { LifeStorySummary } from './LifeStorySummary';
import { EmptyTimelineState } from './EmptyTimelineState';
import { groupEventsByMonth } from '@/data/timelineData';
import type { TimelineEventItem, Milestone, LifeStorySummary as LifeStorySummaryData } from '@/types/timeline';
import styles from './TimelineFeed.module.css';

type TimelineFeedProps = {
  events: TimelineEventItem[];
  milestones: Milestone[];
  petName: string;
  storySummary: LifeStorySummaryData;
  showMilestones?: boolean;
};

export function TimelineFeed({
  events,
  milestones,
  petName,
  storySummary,
  showMilestones = true,
}: TimelineFeedProps) {
  const groups = groupEventsByMonth(events);

  if (events.length === 0) {
    return <EmptyTimelineState petName={petName} filtered />;
  }

  return (
    <div className={styles.feed}>
      <LifeStorySummary summary={storySummary} />

      {showMilestones && milestones.length > 0 && (
        <section className={styles.milestones} aria-labelledby="timeline-milestones">
          <div className={styles.milestonesHead}>
            <h2 id="timeline-milestones" className={styles.milestonesTitle}>
              Milestone moments
            </h2>
            <span className={styles.milestonesCount}>{milestones.length} highlighted</span>
          </div>
          <div className={styles.milestonesScroll}>
            {milestones.map((milestone) => (
              <MilestoneCard key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </section>
      )}

      <div className={styles.timeline}>
        {groups.map((group) => (
          <section key={group.month} className={styles.monthGroup} aria-label={group.month}>
            <div className={styles.monthHeader}>
              <h3 className={styles.monthLabel}>{group.month}</h3>
              <span className={styles.monthCount}>
                {group.events.length} {group.events.length === 1 ? 'moment' : 'moments'}
              </span>
            </div>

            <div className={styles.monthEvents}>
              {group.events.map((event, index) => (
                <div key={event.id} className={styles.eventWrap}>
                  <div className={styles.dot} aria-hidden="true" />
                  <TimelineEventCard event={event} featured={index === 0 && event.type === 'adoption'} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

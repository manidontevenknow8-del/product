import { groupEventsByMonth } from '@/data/timelineData';
import { LifeStorySummary } from '@/components/timeline/LifeStorySummary';
import { MilestoneCard } from '@/components/timeline/MilestoneCard';
import { eventTypeLabels } from '@/types/timeline';
import type { PublicPetStory, PublicStoryEvent } from '@/services/petStoryShare/petStoryShareTypes';
import styles from './PublicStoryView.module.css';

type PublicStoryViewProps = {
  story: PublicPetStory;
};

function PublicStoryEventCard({ event }: { event: PublicStoryEvent }) {
  return (
    <article className={styles.eventCard} data-event-type={event.type}>
      <div className={styles.eventAccent} aria-hidden />
      <div className={styles.eventBody}>
        <div className={styles.eventHeader}>
          <span className={styles.eventType}>{eventTypeLabels[event.type]}</span>
          <time className={styles.eventDate} dateTime={event.date}>
            {event.displayDate}
          </time>
        </div>
        {event.imageUrl && (
          <img src={event.imageUrl} alt="" className={styles.eventImage} loading="lazy" />
        )}
        <h3 className={styles.eventTitle}>{event.title}</h3>
        <p className={styles.eventDescription}>{event.description}</p>
        {event.meta && <span className={styles.eventMeta}>{event.meta}</span>}
      </div>
    </article>
  );
}

export function PublicStoryView({ story }: PublicStoryViewProps) {
  const { snapshot } = story;
  const groups = groupEventsByMonth(snapshot.events);
  const speciesLabel =
    story.species === 'dog' ? 'Dog' : story.species === 'cat' ? 'Cat' : story.species;

  return (
    <div className={styles.view}>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Pet life story</p>
          <h1 className={styles.heroTitle}>{story.petName}</h1>
          <p className={styles.heroMeta}>
            {[speciesLabel, story.breed].filter(Boolean).join(' · ')}
          </p>
        </div>
        {story.photoUrl && (
          <img src={story.photoUrl} alt="" className={styles.heroPhoto} />
        )}
      </header>

      <LifeStorySummary summary={snapshot.summary} />

      {snapshot.milestones.length > 0 && (
        <section className={styles.milestonesSection} aria-labelledby="public-milestones">
          <header className={styles.sectionHead}>
            <p className={styles.sectionKicker}>Featured chapters</p>
            <h2 id="public-milestones" className={styles.sectionTitle}>
              Milestone moments
            </h2>
          </header>
          <div className={styles.milestonesGrid}>
            {snapshot.milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={{
                  ...milestone,
                  thumbnailDocumentId: undefined,
                }}
                petInitial={story.petName}
              />
            ))}
          </div>
        </section>
      )}

      {groups.length > 0 && (
        <section className={styles.chronologySection} aria-labelledby="public-chronology">
          <header className={styles.sectionHead}>
            <p className={styles.sectionKicker}>The chronology</p>
            <h2 id="public-chronology" className={styles.sectionTitle}>
              Month by month
            </h2>
          </header>
          {groups.map((group) => (
            <section key={group.month} className={styles.monthGroup} aria-label={group.month}>
              <h3 className={styles.monthLabel}>{group.month}</h3>
              <div className={styles.monthEvents}>
                {group.events.map((event) => (
                  <PublicStoryEventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))}
        </section>
      )}
    </div>
  );
}

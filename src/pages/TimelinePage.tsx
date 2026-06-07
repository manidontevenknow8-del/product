import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import { PageHeroBand, GettingStartedStrip } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import {
  TimelineFilters,
  TimelineFeed,
  EmptyTimelineState,
  AddEventModal,
} from '@/components/timeline';
import { usePets } from '@/pets';
import { useTimelineData } from '@/hooks/useTimelineData';
import { buildLifeStorySummary } from '@/data/timelineData';
import { getAvatarInitials } from '@/services/pets/petUtils';
import { ROUTES } from '@/routes/paths';
import {
  eventMatchesFilter,
  type TimelineFilter,
} from '@/types/timeline';
import styles from './TimelinePage.module.css';

const TIMELINE_GETTING_STARTED = [
  {
    step: '1',
    title: 'Add your first moment',
    body: 'Capture vet visits, milestones, and everyday memories — each entry becomes part of your pet’s life story.',
    image: PAGE_IMG.app.timeline,
    alt: 'Illustration of a pet life timeline',
  },
  {
    step: '2',
    title: 'Scan a document',
    body: 'Upload bills, prescriptions, or reports — decoded documents can flow straight into the timeline.',
    image: PAGE_IMG.app.scan,
    alt: 'Illustration of scanning a pet document',
  },
  {
    step: '3',
    title: 'Build the profile',
    body: 'Health records and care details on your pet profile power richer timeline entries and reminders.',
    image: PAGE_IMG.app.profile,
    alt: 'Illustration of a complete pet profile',
  },
] as const;

export function TimelinePage() {
  const { activePet, pets } = usePets();
  const petName = activePet?.name ?? 'your pet';
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('all');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const { events, milestones, stats, isLoading, isDemo } = useTimelineData();

  const filteredEvents = useMemo(
    () => events.filter((e) => eventMatchesFilter(e, activeFilter)),
    [events, activeFilter],
  );

  const storySummary = useMemo(
    () =>
      buildLifeStorySummary(events, petName, stats, {
        breed: activePet?.breed,
        species: activePet?.species,
      }),
    [events, petName, stats, activePet?.breed, activePet?.species],
  );

  const hasAnyEvents = events.length > 0;
  const showMilestones = activeFilter === 'all' || activeFilter === 'milestones';

  const heroSubtitle = activePet?.breed
    ? `${activePet.breed} · ${stats.totalMoments} moments · ${stats.daysRemembered} days remembered`
    : `${stats.totalMoments} moments captured across ${stats.daysRemembered} days`;

  const statItems = [
    { value: stats.totalMoments, label: 'Moments' },
    { value: stats.milestones, label: 'Milestones' },
    { value: stats.documents, label: 'Documents' },
    { value: stats.daysRemembered, label: 'Days' },
  ];

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.loadingWrap}>
            <LoadingState message="Loading your pet's story…" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!activePet && pets.length === 0) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <PageHeroBand
            image={PAGE_IMG.app.timeline}
            imageAlt=""
            eyebrow="Pet life story"
            title="Your pet's timeline"
            subtitle="Every pet has a story waiting to be told."
          />
          <div className={styles.body}>
            <EmptyTimelineState petName={petName} />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!activePet) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <PageHeroBand
            image={PAGE_IMG.app.timeline}
            imageAlt=""
            eyebrow="Pet life story"
            title="Timeline"
            subtitle="Select a pet to view their story."
          />
          <div className={styles.body}>
            <div className={styles.stateWrap}>
              <EmptyState
                title="Select a pet"
                description="Choose a pet from your dashboard to view their life story, milestones, and documents."
                action={
                  <Link to={ROUTES.DASHBOARD}>
                    <Button variant="primary" size="md">
                      Go to dashboard
                    </Button>
                  </Link>
                }
              />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <PageHeroBand
          image={PAGE_IMG.app.timeline}
          imageAlt=""
          eyebrow="Pet life story"
          title={`${petName}'s timeline`}
          subtitle={heroSubtitle}
          avatar={{
            src: activePet.photoUrl,
            initials: getAvatarInitials(petName),
          }}
          actions={
            <Button variant="secondary" size="sm" onClick={() => setShowAddEvent(true)}>
              Add moment
            </Button>
          }
        />

        <div className={styles.body}>
          {isDemo && (
            <p className={styles.demoBanner}>
              Preview mode — timeline demo data is enabled via VITE_DEMO_TIMELINE.
            </p>
          )}

          <div className={styles.stats} aria-label="Timeline summary">
            {statItems.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {hasAnyEvents ? (
            <>
              <TimelineFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                events={events}
              />

              {filteredEvents.length > 0 ? (
                <TimelineFeed
                  events={filteredEvents}
                  milestones={milestones}
                  petName={petName}
                  storySummary={storySummary}
                  showMilestones={showMilestones}
                />
              ) : (
                <EmptyTimelineState petName={petName} filtered />
              )}
            </>
          ) : (
            <GettingStartedStrip
              title="Start preserving memories"
              description={`${petName}'s story is waiting for its first chapter. Follow these steps to build a timeline worth revisiting.`}
              steps={TIMELINE_GETTING_STARTED}
            />
          )}
        </div>
      </div>

      <AddEventModal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        petName={petName}
      />
    </AppLayout>
  );
}

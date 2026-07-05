import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventTracker } from '@/analytics/EventTracker';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import { PremiumUpgradePrompt, UpgradeModal } from '@/components/subscription';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { FREE_TIMELINE_DAYS } from '@/subscription/featureGates';
import { partitionTimelineEvents } from '@/utils/timelineAccess';
import { GettingStartedStrip } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import {
  TimelineFilters,
  TimelineFeed,
  EmptyTimelineState,
  AddEventModal,
  StoryShareCard,
} from '@/components/timeline';
import { EditorialHero, KpiStrip } from '@/components/editorial';
import { usePets } from '@/pets';
import { useDocuments } from '@/documents';
import { useHousehold } from '@/household';
import { usePetStoryShare } from '@/hooks/usePetStoryShare';
import { usePetMoments } from '@/petMoments';
import { useTimelineData } from '@/hooks/useTimelineData';
import { buildLifeStorySummary } from '@/data/timelineData';
import { buildMilestonesFromEvents } from '@/services/timeline/timelineBuilder';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { getAvatarInitials } from '@/services/pets/petUtils';
import type { PetRecord } from '@/services/pets/petTypes';
import { ROUTES } from '@/routes/paths';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import {
  eventMatchesFilter,
  type TimelineFilter,
} from '@/types/timeline';
import styles from './TimelinePage.module.css';

const TIMELINE_GETTING_STARTED = [
  {
    step: '1',
    title: 'Add your first moment',
    body: "Capture vet visits, milestones, and everyday memories — each entry becomes part of your pet's life story.",
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

function PetStack({
  pets,
  activeId,
  onSelect,
}: {
  pets: PetRecord[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (pets.length <= 1) return null;

  return (
    <div className={styles.petStack} role="tablist" aria-label="Switch pet">
      {pets.map((pet, index) => (
        <button
          key={pet.id}
          type="button"
          role="tab"
          aria-selected={pet.id === activeId}
          aria-label={pet.name}
          title={pet.name}
          style={{ zIndex: index + 1 }}
          onClick={() => onSelect(pet.id)}
          className={`${styles.petStackBtn} ${pet.id === activeId ? styles.petStackBtnActive : ''}`}
        >
          <span className={styles.petStackBtnInner}>
            {pet.photoUrl ? (
              <img src={pet.photoUrl} alt="" className={styles.petStackImg} />
            ) : (
              <span className={styles.petStackInitials}>{getAvatarInitials(pet.name)}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

export function TimelinePage() {
  const { activePet, pets, setActivePet } = usePets();

  useEffect(() => {
    eventTracker.track('timeline_viewed');
  }, []);
  const { canEdit } = useHousehold();
  const { createMoment } = usePetMoments();
  const { getDocumentUrl } = useDocuments();
  const { canAccess } = useSubscription();
  const hasFullTimeline = canAccess('premiumTimeline');
  const petName = activePet?.name ?? 'your pet';
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('all');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { events, stats, isLoading, isDemo } = useTimelineData();
  const {
    share: storyShare,
    isLoading: storyShareLoading,
    canEdit: canEditStoryShare,
    ensureLink: ensureStoryLink,
    refreshSnapshot: refreshStorySnapshot,
    regenerateToken: regenerateStoryToken,
  } = usePetStoryShare({
    pet: activePet,
    events,
    stats,
    hasFullTimeline,
    resolveDocumentUrl: getDocumentUrl,
  });

  const tierPartition = useMemo(() => {
    if (hasFullTimeline) {
      return { visible: events, locked: [] as typeof events };
    }
    return partitionTimelineEvents(events);
  }, [events, hasFullTimeline]);

  const tierVisibleEvents = tierPartition.visible;
  const lockedEventCount = tierPartition.locked.length;

  const displayEvents = useMemo(() => {
    const pool = hasFullTimeline ? events : tierVisibleEvents;
    return pool.filter((e) => eventMatchesFilter(e, activeFilter));
  }, [events, tierVisibleEvents, hasFullTimeline, activeFilter]);

  const filteredLockedEvents = useMemo(() => {
    if (hasFullTimeline) return [];
    return partitionTimelineEvents(
      events.filter((e) => eventMatchesFilter(e, activeFilter)),
    ).locked;
  }, [events, activeFilter, hasFullTimeline]);

  const storySummary = useMemo(
    () =>
      buildLifeStorySummary(events, petName, stats, {
        breed: activePet?.breed,
        species: activePet?.species,
      }, {
        hasFullTimeline,
        lockedMomentsCount: lockedEventCount,
        freeTimelineDays: FREE_TIMELINE_DAYS,
      }),
    [events, petName, stats, activePet?.breed, activePet?.species, hasFullTimeline, lockedEventCount],
  );

  const showMilestones = activeFilter === 'all' || activeFilter === 'milestones';

  const displayMilestones = useMemo(() => {
    if (!showMilestones) return [];
    const pool =
      activeFilter === 'milestones'
        ? displayEvents
        : hasFullTimeline
          ? events
          : tierVisibleEvents;
    return buildMilestonesFromEvents(pool);
  }, [showMilestones, activeFilter, displayEvents, events, tierVisibleEvents, hasFullTimeline]);

  const milestonesAccessNote =
    !hasFullTimeline && lockedEventCount > 0
      ? `Showing milestone moments from the last ${FREE_TIMELINE_DAYS} days on Free. Older turning points remain in ${petName}'s full archive — upgrade to Plus to see them all.`
      : !hasFullTimeline
        ? `Showing milestone moments from the last ${FREE_TIMELINE_DAYS} days on Free.`
        : undefined;

  const hasAnyEvents = events.length > 0;

  const heroSubtitle =
    stats.totalMoments > 0
      ? hasFullTimeline
        ? `${stats.totalMoments} moment${stats.totalMoments === 1 ? '' : 's'} woven into one living story`
        : lockedEventCount > 0
          ? `${stats.totalMoments} moments in ${petName}'s full archive · chronology shows the last ${FREE_TIMELINE_DAYS} days`
          : `${stats.totalMoments} moment${stats.totalMoments === 1 ? '' : 's'} in ${petName}'s story · last ${FREE_TIMELINE_DAYS} days below`
      : 'A story waiting for its first chapter';

  const statBandNote =
    !hasFullTimeline && stats.totalMoments > 0
      ? lockedEventCount > 0
        ? `Full-archive totals · ${lockedEventCount} older moment${lockedEventCount === 1 ? '' : 's'} unlock with Plus`
        : `Full-archive totals · chronology limited to the last ${FREE_TIMELINE_DAYS} days on Free`
      : null;

  const statItems = [
    { value: stats.totalMoments, label: 'Total moments' },
    { value: stats.milestones, label: 'Milestones' },
    { value: stats.documents, label: 'Documents' },
    { value: stats.daysRemembered, label: 'Days tracked' },
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
          <div className={styles.emptyHero}>
            <div className={styles.emptyHeroInner}>
              <p className={styles.heroKicker}>Pet life story</p>
              <h1 className={styles.emptyHeroTitle}>Your pet's timeline</h1>
              <p className={styles.emptyHeroLead}>Every pet has a story waiting to be told.</p>
            </div>
          </div>
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
          <div className={styles.emptyHero}>
            <div className={styles.emptyHeroInner}>
              <p className={styles.heroKicker}>Pet life story</p>
              <h1 className={styles.emptyHeroTitle}>Timeline</h1>
              <p className={styles.emptyHeroLead}>Select a pet to view their story.</p>
            </div>
          </div>
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

  const heroPhoto = normalizePhotoUrlFromDb(activePet.photoUrl);
  const heroBackground = resolvePetHeroBackground(activePet.photoUrl);

  const heroContext = [
    activePet.breed,
    activePet.species !== 'other' ? activePet.species : null,
    stats.daysRemembered > 0 ? `${stats.daysRemembered} days remembered` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <div className={styles.heroWrap}>
          <EditorialHero
            backgroundSrc={heroBackground.src}
            isPetPhoto={heroBackground.isPetPhoto}
            compact
            topSlot={
              <PetStack pets={pets} activeId={activePet.id} onSelect={setActivePet} />
            }
            kicker="Life story"
            title={petName}
            meta={heroContext || undefined}
            subtitle={heroSubtitle}
            portraitSrc={heroPhoto ?? heroBackground.src}
            showPortrait={Boolean(heroPhoto || heroBackground.isPetPhoto)}
          >
            <button type="button" className="ed-btn" onClick={() => setShowAddEvent(true)}>
              Add moment
            </button>
            <Link to={ROUTES.PET_PROFILE} className="ed-btn-ghost">
              View archive
            </Link>
          </EditorialHero>

          <KpiStrip
            items={statItems}
            note={statBandNote}
            variant="glass"
            aria-label="Timeline summary"
          />
        </div>

        <div className={styles.body}>
          {isDemo && (
            <p className={styles.demoBanner}>
              Preview mode — timeline demo data is enabled via VITE_DEMO_TIMELINE.
            </p>
          )}

          {hasAnyEvents ? (
            <div className={styles.contentStack}>
              <StoryShareCard
                petId={activePet.id}
                petName={petName}
                share={storyShare}
                isLoading={storyShareLoading}
                hasFullTimeline={hasFullTimeline}
                canEdit={canEditStoryShare}
                onEnsureLink={ensureStoryLink}
                onRefreshSnapshot={refreshStorySnapshot}
                onRegenerateToken={regenerateStoryToken}
              />

              <section className={styles.filterChapter} data-reveal aria-label="Filter timeline">
                <TimelineFilters
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  events={events}
                />
              </section>

              {displayEvents.length > 0 ? (
                <>
                  <TimelineFeed
                    events={displayEvents}
                    milestones={displayMilestones}
                    petName={petName}
                    storySummary={storySummary}
                    showMilestones={showMilestones}
                    milestonesAccessNote={milestonesAccessNote}
                    onAddMoment={() => setShowAddEvent(true)}
                  />
                  {filteredLockedEvents.length > 0 && (
                    <div className={styles.proGate}>
                      <PremiumUpgradePrompt
                        feature="premiumTimeline"
                        onUpgrade={() => setUpgradeOpen(true)}
                        emotionalOverride={`${filteredLockedEvents.length} older moment${filteredLockedEvents.length === 1 ? '' : 's'} from before the last ${FREE_TIMELINE_DAYS} days are waiting in ${petName}'s full story. Upgrade to Plus to revisit every chapter.`}
                      />
                    </div>
                  )}
                </>
              ) : filteredLockedEvents.length > 0 ? (
                <div className={styles.proGate}>
                  <PremiumUpgradePrompt
                    feature="premiumTimeline"
                    onUpgrade={() => setUpgradeOpen(true)}
                    emotionalOverride={`Your older memories are saved — Free shows the last ${FREE_TIMELINE_DAYS} days. Upgrade to Plus to see ${petName}'s complete timeline.`}
                  />
                </div>
              ) : (
                <TimelineFeed
                  events={[]}
                  milestones={[]}
                  petName={petName}
                  storySummary={storySummary}
                  showMilestones={false}
                  filteredEmpty
                  activeFilter={activeFilter}
                  onAddMoment={() => setShowAddEvent(true)}
                />
              )}
            </div>
          ) : (
            <GettingStartedStrip
              title="Start preserving memories"
              description={`${petName}'s story is waiting for its first chapter. Follow these steps to build a timeline worth revisiting.`}
              steps={TIMELINE_GETTING_STARTED}
            />
          )}

          <footer className={styles.legalFooter}>
            <hr className={styles.legalRule} />
            <p className={styles.legalText} role="note">
              {HEALTH_DISCLAIMER}
            </p>
          </footer>
        </div>
      </div>

      <AddEventModal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        petName={petName}
        canEdit={canEdit}
        onSubmit={async (input) => {
          await createMoment({
            caption: input.caption,
            photoUrl: input.photoUrl,
            occurredAt: input.occurredAt,
          });
        }}
      />

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        targetPlan="plus"
      />
    </AppLayout>
  );
}

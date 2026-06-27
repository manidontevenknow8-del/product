import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
} from '@/components/timeline';
import { usePets } from '@/pets';
import { useTimelineData } from '@/hooks/useTimelineData';
import { buildLifeStorySummary } from '@/data/timelineData';
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
  const { canAccess } = useSubscription();
  const hasFullTimeline = canAccess('premiumTimeline');
  const petName = activePet?.name ?? 'your pet';
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('all');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const { events, milestones, stats, isLoading, isDemo } = useTimelineData();

  const filteredEvents = useMemo(
    () => events.filter((e) => eventMatchesFilter(e, activeFilter)),
    [events, activeFilter],
  );

  const { visible: freeVisibleEvents, locked: lockedEvents } = useMemo(() => {
    if (canAccess('premiumTimeline')) {
      return { visible: filteredEvents, locked: [] as typeof filteredEvents };
    }
    return partitionTimelineEvents(filteredEvents);
  }, [filteredEvents, canAccess]);

  const displayEvents = hasFullTimeline ? filteredEvents : freeVisibleEvents;

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

  const heroSubtitle =
    stats.totalMoments > 0
      ? `${stats.totalMoments} moment${stats.totalMoments === 1 ? '' : 's'} woven into one living story`
      : 'A story waiting for its first chapter';

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
          <header className={styles.hero}>
            <img
              className={`${styles.heroBg} ${heroBackground.isPetPhoto ? styles.heroBgPet : ''}`}
              src={heroBackground.src}
              alt=""
              aria-hidden
            />
            <div className={styles.heroWash} aria-hidden />
            <div className={styles.heroTexture} aria-hidden />
            <div className={styles.heroFade} aria-hidden />

            <div className={styles.heroInner}>
              <div className={styles.heroTopRow}>
                <PetStack pets={pets} activeId={activePet.id} onSelect={setActivePet} />
              </div>

              <div className={styles.heroCoverGrid}>
                <div className={styles.heroCoverText}>
                  <p className={styles.heroKicker}>Life story</p>
                  <h1 className={styles.heroTitle}>{petName}</h1>
                  {heroContext && <p className={styles.heroContext}>{heroContext}</p>}
                  <p className={styles.heroSubtitle}>{heroSubtitle}</p>
                  <div className={styles.heroCtaRow}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={() => setShowAddEvent(true)}
                    >
                      Add moment
                    </button>
                    <Link to={ROUTES.PET_PROFILE} className={styles.btnSecondary}>
                      View archive
                    </Link>
                  </div>
                </div>

                {(heroPhoto || heroBackground.isPetPhoto) && (
                  <div className={styles.heroPortraitFrame} aria-hidden>
                    <img
                      src={heroPhoto ?? heroBackground.src}
                      alt=""
                      className={styles.heroPortraitImg}
                    />
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className={styles.statBand} data-reveal aria-label="Timeline summary">
            <div className={styles.statBandInner}>
              {statItems.map((stat) => (
                <div key={stat.label} className={styles.statCell}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.body}>
          {isDemo && (
            <p className={styles.demoBanner}>
              Preview mode — timeline demo data is enabled via VITE_DEMO_TIMELINE.
            </p>
          )}

          {hasAnyEvents ? (
            <div className={styles.contentStack}>
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
                    milestones={milestones}
                    petName={petName}
                    storySummary={storySummary}
                    showMilestones={showMilestones}
                    onAddMoment={() => setShowAddEvent(true)}
                  />
                  {lockedEvents.length > 0 && (
                    <div className={styles.proGate}>
                      <PremiumUpgradePrompt
                        feature="premiumTimeline"
                        onUpgrade={() => setUpgradeOpen(true)}
                        emotionalOverride={`${lockedEvents.length} older moment${lockedEvents.length === 1 ? '' : 's'} from before the last ${FREE_TIMELINE_DAYS} days are waiting in ${petName}'s full story. Upgrade to Plus to revisit every chapter.`}
                      />
                    </div>
                  )}
                </>
              ) : lockedEvents.length > 0 ? (
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
      />

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        targetPlan="plus"
      />
    </AppLayout>
  );
}

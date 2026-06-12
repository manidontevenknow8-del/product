import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState, PremiumGate } from '@/components/ui';
import { GatedPagePreview } from '@/components/premium/GatedPagePreview';
import { PetSwitcher } from '@/components/pets';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { ROUTES } from '@/routes/paths';
import hero from '@/styles/EditorialHero.module.css';
import styles from './VetPortalPage.module.css';

const VET_HERO_IMAGE =
  'https://images.unsplash.com/photo-1628009368231-7bb7cfc4baff?auto=format&fit=crop&w=1800&q=80';

const RECORD_TYPE_LABEL: Record<string, string> = {
  vaccination: 'Vaccination',
  medication: 'Medication',
  allergy: 'Allergy',
  diagnosis: 'Diagnosis',
  surgery: 'Surgery',
  wellness: 'Wellness',
};

function VetReadOnlyDashboard({
  petName,
  records,
  documentCount,
}: {
  petName: string;
  records: ReturnType<typeof useHealthRecords>['records'];
  documentCount: number;
}) {
  const sorted = useMemo(
    () => [...records].sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded)),
    [records],
  );

  return (
    <div className={styles.dashboard}>
      <article className={styles.summaryCard}>
        <p className={styles.eyebrow}>Clinician view · read-only</p>
        <h2 className={styles.title}>{petName}&apos;s structured history</h2>
        <p className={styles.lead}>
          Secure link preview - chronological medical events, documents, and care notes as your
          veterinary team would see them.
        </p>
        <dl className={styles.stats}>
          <div>
            <dt className={styles.statLabel}>Health records</dt>
            <dd className={styles.statValue}>{records.length}</dd>
          </div>
          <div>
            <dt className={styles.statLabel}>Documents</dt>
            <dd className={styles.statValue}>{documentCount}</dd>
          </div>
          <div>
            <dt className={styles.statLabel}>Access mode</dt>
            <dd className={styles.statValueSm}>Live sync · view only</dd>
          </div>
        </dl>
      </article>

      <section>
        <h3 className={styles.timelineTitle}>Chronological timeline</h3>
        {sorted.length === 0 ? (
          <p className={styles.timelineEmpty}>
            No health records yet - add vaccinations, medications, and visit notes to populate this
            view.
          </p>
        ) : (
          <ul className={styles.timelineList}>
            {sorted.map((record) => (
              <li key={record.id} className={styles.timelineItem}>
                <time className={styles.timelineDate} dateTime={record.dateRecorded}>
                  {formatHealthRecordDate(record.dateRecorded)}
                </time>
                <div>
                  <p className={styles.recordType}>
                    {RECORD_TYPE_LABEL[record.recordType] ?? record.recordType}
                  </p>
                  <p className={styles.recordTitle}>{record.title}</p>
                  {record.description && (
                    <p className={styles.recordDesc}>{record.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <article className={styles.linkCard}>
        <p className={styles.eyebrow}>Secure link</p>
        <p className={styles.linkUrl}>
          https://petclues.app/vet/{petName.toLowerCase().replace(/\s+/g, '-')}-●●●●
        </p>
        <p className={styles.linkNote}>
          Links expire after 72 hours and can be revoked instantly from settings.
        </p>
      </article>
    </div>
  );
}

export function VetPortalPage() {
  const vetAccess = useFeatureAccess('vetCollaboration');
  const { activePet, pets, setActivePet, isLoading: petsLoading, hasPets } = usePets();
  const { records, isLoading: recordsLoading } = useHealthRecords();
  const { documents, isLoading: documentsLoading } = useDocuments();

  const petRecords = useMemo(
    () => (activePet ? records.filter((r) => r.petId === activePet.id) : []),
    [records, activePet],
  );

  const petDocuments = useMemo(
    () => (activePet ? documents.filter((d) => d.petId === activePet.id) : []),
    [documents, activePet],
  );

  const isLoading = petsLoading || recordsLoading || documentsLoading;

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={hero.loadingWrap}>
          <LoadingState message="Loading vet portal" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet) {
    return (
      <AppLayout flushContent>
        <div className={hero.stateWrap}>
          <h1 className={hero.stateTitle}>Vet Collaboration</h1>
          <p className={hero.stateText}>
            Add a pet profile to generate secure clinical sharing links.
          </p>
          <Link to={ROUTES.PET_PROFILE} className={hero.stateLink}>
            Go to pet profile →
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!vetAccess.isAllowed) {
    return (
      <AppLayout flushContent>
        <div className={hero.gatedWrap}>
          <PremiumGate
            requiredTier="Pro"
            title="Live Veterinary Sync"
            description="Pro members can generate secure, read-only live web links for veterinary clinics, giving doctors instant access to structured, chronological medical histories."
            className={styles.gateMinHeight}
          >
            <GatedPagePreview
              imageUrl={VET_HERO_IMAGE}
              eyebrow="Clinical collaboration"
              title="Vet Collaboration Portal"
              subtitle="Warm, read-only access for the clinicians who care for your companion."
            />
          </PremiumGate>
          <div className={hero.divider}>
            <HealthDisclaimerNote compact />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout flushContent>
      <div className={hero.page}>
        <header className={`${hero.header} ${hero.headerTall}`}>
          <img src={VET_HERO_IMAGE} alt="" className={hero.bg} aria-hidden />
          <div className={`${hero.scrim} ${hero.scrimDeep}`} aria-hidden />
          <div className={hero.switcherSlot}>
            <PetSwitcher pets={pets} activeId={activePet.id} onSelect={setActivePet} />
          </div>
          <div className={`${hero.inner} ${hero.innerTall}`}>
            <p className={hero.eyebrow}>Clinical collaboration</p>
            <h1 className={hero.title}>Vet Collaboration Portal</h1>
            <p className={hero.lead}>
              Warm, read-only access for the clinicians who care for {activePet.name}.
            </p>
          </div>
        </header>

        <div className={hero.body}>
          <VetReadOnlyDashboard
            petName={activePet.name}
            records={petRecords}
            documentCount={petDocuments.length}
          />
          <div className={hero.divider}>
            <HealthDisclaimerNote compact />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

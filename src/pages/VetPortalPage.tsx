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
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import { ROUTES } from '@/routes/paths';
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

function VetTimeline({
  records,
}: {
  records: ReturnType<typeof useHealthRecords>['records'];
}) {
  const sorted = useMemo(
    () => [...records].sort((a, b) => b.dateRecorded.localeCompare(a.dateRecorded)),
    [records],
  );

  if (sorted.length === 0) {
    return (
      <p className={styles.timelineEmpty}>
        No health records yet — add vaccinations, medications, and visit notes to populate this
        view.
      </p>
    );
  }

  return (
    <ul className={styles.timeline}>
      {sorted.map((record) => (
        <li key={record.id} className={styles.timelineItem}>
          <time className={styles.timelineDate} dateTime={record.dateRecorded}>
            {formatHealthRecordDate(record.dateRecorded)}
          </time>
          <p className={styles.recordType}>
            {RECORD_TYPE_LABEL[record.recordType] ?? record.recordType}
          </p>
          <p className={styles.recordTitle}>{record.title}</p>
          {record.description && <p className={styles.recordDesc}>{record.description}</p>}
        </li>
      ))}
    </ul>
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
        <div className="ed-loading">
          <LoadingState message="Loading vet portal" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet) {
    return (
      <AppLayout flushContent>
        <div className="ed-loading" style={{ textAlign: 'center' }}>
          <h1 className="ed-title" style={{ marginInline: 'auto' }}>
            Vet Collaboration
          </h1>
          <p className="ed-lead" style={{ marginInline: 'auto' }}>
            Add a pet profile to generate secure clinical sharing links.
          </p>
          <Link to={ROUTES.PET_PROFILE} className="ed-btn-line" style={{ marginTop: 24 }}>
            Go to pet profile →
          </Link>
        </div>
      </AppLayout>
    );
  }

  const heroBg = resolvePetHeroBackground(activePet.photoUrl);
  const heroSrc = heroBg.isPetPhoto ? heroBg.src : VET_HERO_IMAGE;
  const heroPhoto = normalizePhotoUrlFromDb(activePet.photoUrl);
  const secureLink = `petclues.app/vet/${activePet.name.toLowerCase().replace(/\s+/g, '-')}-●●●●`;

  if (!vetAccess.isAllowed) {
    return (
      <AppLayout flushContent>
        <div className="ed-page">
          <div className="ed-body">
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
            <footer className="ed-footnote">
              <hr />
              <HealthDisclaimerNote compact />
            </footer>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout flushContent>
      <div className="ed-page">
        <header className="ed-hero">
          <img
            className={`ed-hero__bg ${heroBg.isPetPhoto ? 'ed-hero__bg--pet' : ''}`}
            src={heroSrc}
            alt=""
            aria-hidden
          />
          <div className="ed-hero__wash" aria-hidden />
          <div className="ed-hero__texture" aria-hidden />
          <div className="ed-hero__inner">
            <div className="ed-hero__top">
              <PetSwitcher pets={pets} activeId={activePet.id} onSelect={setActivePet} />
            </div>
            <div className="ed-hero__grid">
              <div className="ed-hero__text">
                <p className="ed-hero__kicker">Clinical collaboration</p>
                <h1 className="ed-hero__title">Vet Collaboration Portal</h1>
                <p className="ed-hero__subtitle">
                  Warm, read-only access to {activePet.name}&apos;s structured history — for the
                  clinicians who care for them.
                </p>
                <div className="ed-hero__cta">
                  <a href="#secure-link" className="ed-btn">
                    Secure share link
                  </a>
                  <a href="#history" className="ed-btn-ghost">
                    View history
                  </a>
                </div>
              </div>
              {heroPhoto && (
                <div className="ed-hero__portrait" aria-hidden>
                  <img src={heroPhoto} alt="" />
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="ed-stats" style={{ ['--ed-stat-cols' as string]: 3 }} aria-label="Record summary">
          <div className="ed-stats__inner">
            <div className="ed-stat">
              <div className="ed-stat__value">{petRecords.length}</div>
              <p className="ed-stat__label">Health records</p>
            </div>
            <div className="ed-stat">
              <div className="ed-stat__value">{petDocuments.length}</div>
              <p className="ed-stat__label">Documents</p>
            </div>
            <div className="ed-stat">
              <div className="ed-stat__value" style={{ fontStyle: 'italic', fontSize: '1.5rem' }}>
                Live · view only
              </div>
              <p className="ed-stat__label">Access mode</p>
            </div>
          </div>
        </section>

        <div className="ed-body">
          <section className="ed-chapter" id="history" aria-label="Chronological history">
            <div className="ed-chapter__intro">
              <p className="ed-eyebrow">Clinician view · read-only</p>
              <h2 className="ed-title">{activePet.name}&apos;s structured history</h2>
              <p className="ed-lead">
                Chronological medical events and care notes, exactly as your veterinary team would
                see them through a secure link.
              </p>
            </div>
            <VetTimeline records={petRecords} />
          </section>

          <section className="ed-band" id="secure-link" aria-label="Secure link">
            <div className="ed-band__texture" aria-hidden />
            <span className="ed-band__watermark" aria-hidden>
              Secure
            </span>
            <div className="ed-band__inner">
              <p className="ed-eyebrow">Secure link</p>
              <h2 className="ed-band__title">Share with your clinic in one tap</h2>
              <p className="ed-band__text">
                A live, read-only web link your veterinarian can open instantly — no logins, no PDFs.
              </p>
              <p className={styles.linkUrl}>https://{secureLink}</p>
              <p className={styles.linkNote}>
                Links expire after 72 hours and can be revoked instantly from settings.
              </p>
            </div>
          </section>

          <footer className="ed-footnote">
            <hr />
            <HealthDisclaimerNote compact />
          </footer>
        </div>
      </div>
    </AppLayout>
  );
}

import { useState, useEffect, useMemo, useCallback, useRef, type RefObject } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState, PremiumGate } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { canCreateHealthRecord } from '@/subscription/featureGates';
import { EmptyPetProfileState } from '@/components/empty-states';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { HealthRecordModal } from '@/components/pet-profile/HealthRecordModal';
import { PassportExportSheet } from '@/components/emergency';
import { useAnalytics } from '@/analytics';
import { downloadBlob, exportNodeToPng } from '@/utils/imageExport';
import { usePets } from '@/pets';
import { PetSwitcherHero } from '@/components/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { useEmergencyPassport } from '@/hooks/useEmergencyPassport';
import { buildPublicEmergencyUrl } from '@/services/emergencyPassport/emergencyPassportTypes';
import { buildPassportSummary, formatPassportRecordLine } from '@/services/passport/passportService';
import type { CreateHealthRecordInput } from '@/services/healthRecords/healthRecordService';
import type { HealthRecord, HealthRecordType } from '@/services/healthRecords/healthRecordTypes';
import { UpgradeModal } from '@/components/subscription';
import { EditorialUpgradeModal } from '@/components/ui';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './EmergencyPassportPage.module.css';

const PET_PORTRAIT_PLACEHOLDER =
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80';

function PassportRecordBlock({
  title,
  records,
  emptyMessage,
  variant = 'default',
  onAdd,
  onEdit,
}: {
  title: string;
  records: HealthRecord[];
  emptyMessage: string;
  variant?: 'default' | 'critical';
  onAdd?: () => void;
  onEdit?: (record: HealthRecord) => void;
}) {
  const isCritical = variant === 'critical';
  return (
    <section className={`${styles.recordBlock} ${isCritical ? styles.recordBlockCritical : ''}`}>
      <div className={styles.blockHead}>
        <h3 className={`${styles.blockTitle} ${isCritical ? styles.blockTitleCritical : ''}`}>
          {title}
        </h3>
        {onAdd && (
          <button type="button" onClick={onAdd} className={styles.blockAdd}>
            Add
          </button>
        )}
      </div>
      {records.length === 0 ? (
        <p className={styles.emptyLine}>{emptyMessage}</p>
      ) : (
        <ul className={styles.recordList}>
          {records.map((record) => (
            <li key={record.id} className={styles.recordItem}>
              <button type="button" className={styles.recordBtn} onClick={() => onEdit?.(record)}>
                {formatPassportRecordLine(record)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Placeholder medical blocks inside PremiumGate - no real user health data */
function PassportMedicalGatePreview() {
  return (
    <div className={styles.gatePreview}>
      <PassportRecordBlock
        title="Critical allergies"
        records={[]}
        emptyMessage="No allergies on file - add known reactions for safer care."
        variant="critical"
      />
      <PassportRecordBlock
        title="Active medications"
        records={[]}
        emptyMessage="No medications recorded."
      />
      <section className={styles.recordBlock}>
        <div className={styles.blockHead}>
          <h3 className={styles.blockTitle}>Emergency contacts</h3>
        </div>
        <div className={styles.contactItem}>
          <p className={styles.contactName}>Primary owner</p>
          <p className={styles.contactMeta}>Add your contact details for emergency routing.</p>
        </div>
        <div className={styles.contactItem}>
          <p className={styles.contactName}>Veterinary clinic</p>
          <p className={styles.contactMeta}>
            Add your vet&apos;s details in health records for faster emergency routing.
          </p>
        </div>
      </section>
    </div>
  );
}

function PassportDailyCareBlock({
  passport,
}: {
  passport: ReturnType<typeof buildPassportSummary>;
}) {
  const { careContext } = passport;

  return (
    <section className={styles.recordBlock}>
      <div className={styles.blockHead}>
        <h3 className={styles.blockTitle}>Recent feeding &amp; activity</h3>
      </div>
      <p className={styles.careMeta}>
        Last 14 days · {careContext.weekSummary.totalWalkKm} km walked this week ·{' '}
        {careContext.weekSummary.daysLogged} day
        {careContext.weekSummary.daysLogged === 1 ? '' : 's'} logged this week
      </p>
      {careContext.recentDailyCare.length === 0 ? (
        <p className={styles.emptyLine}>
          No daily check-ins yet — log feeding and walks from your dashboard so vets see recent
          routines in an emergency.
        </p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.careTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Fed</th>
                <th>Walk</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {careContext.recentDailyCare.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.dateLabel}</td>
                  <td>{entry.feeding}</td>
                  <td>{entry.walkLabel}</td>
                  <td>{entry.weightLabel ?? 'Not recorded'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PassportWeightBlock({
  passport,
  onAdd,
  onEdit,
}: {
  passport: ReturnType<typeof buildPassportSummary>;
  onAdd?: () => void;
  onEdit?: (record: HealthRecord) => void;
}) {
  const { careContext, weightRecords } = passport;

  return (
    <PassportRecordBlock
      title="Weight history"
      records={weightRecords}
      emptyMessage={
        careContext.profileWeight
          ? `Profile weight: ${careContext.profileWeight} - add dated weigh-ins for trend tracking.`
          : 'No weight records - log weigh-ins from the pet profile for emergency context.'
      }
      onAdd={onAdd}
      onEdit={onEdit}
    />
  );
}

function PremiumPassportTools({
  passport,
  exportRef,
  onExport,
  exporting,
  exportError,
  hasEmergencyMode,
  onEmergencyModeUpgrade,
  publicShareUrl,
}: {
  passport: ReturnType<typeof buildPassportSummary>;
  exportRef: RefObject<HTMLDivElement | null>;
  onExport: () => void;
  exporting: boolean;
  exportError: string | null;
  hasEmergencyMode: boolean;
  onEmergencyModeUpgrade: () => void;
  publicShareUrl: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const link = publicShareUrl ?? passport.identity.secureLink;

  const handleCopy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <div className={styles.toolStack}>
        <button type="button" onClick={onExport} disabled={exporting} className={styles.tool}>
          <p className={styles.toolKicker}>Export</p>
          <p className={styles.toolTitle}>Print-ready sheet</p>
          <p className={styles.toolDesc}>
            Download a high-resolution PNG for travel, boarding, or clinics.
          </p>
          {exporting && <p className={styles.toolNote}>Preparing download…</p>}
        </button>
        <button type="button" onClick={() => void handleCopy()} className={styles.tool} disabled={!link}>
          <p className={styles.toolKicker}>Share</p>
          <p className={styles.toolTitle}>Emergency share link</p>
          <p className={styles.toolDesc}>
            Token-gated public page — allergies, meds, vet, insurance, and microchip only.
          </p>
          {link ? <p className={styles.toolLink}>{link}</p> : (
            <p className={styles.toolNote}>Create a share link from Home or Records.</p>
          )}
          {copied && <p className={styles.toolNote}>Link copied</p>}
        </button>

        {hasEmergencyMode ? (
          <div className={styles.tool}>
            <p className={styles.toolKicker}>Emergency mode</p>
            <p className={styles.toolTitle}>Activate rapid handoff</p>
            <p className={styles.toolDesc}>
              Pin critical allergies and medications to your lock-screen summary for pet sitters and
              emergency clinicians.
            </p>
            <span className="ed-btn" style={{ marginTop: 20 }}>
              Enable emergency mode
            </span>
          </div>
        ) : (
          <button type="button" onClick={onEmergencyModeUpgrade} className={styles.tool}>
            <p className={styles.toolKicker}>Emergency mode · Pro</p>
            <p className={styles.toolTitle}>Activate rapid handoff</p>
            <p className={styles.toolDesc}>
              Upgrade to Pro to pin critical allergies and medications to a lock-screen summary for
              pet sitters and emergency clinicians.
            </p>
            <span className="ed-btn" style={{ marginTop: 20 }}>
              Upgrade to Pro
            </span>
          </button>
        )}
      </div>

      {exportError && (
        <p className={styles.emergencyNote} role="alert">
          {exportError}
        </p>
      )}

      <PassportExportSheet ref={exportRef} passport={passport} />
    </>
  );
}

export function EmergencyPassportPage() {
  const { track } = useAnalytics();
  const { user } = useAuth();
  const passportAccess = useFeatureAccess('emergencyCareMode');
  const emergencyModeAccess = useFeatureAccess('emergencyMode');
  const [healthUpgradeOpen, setHealthUpgradeOpen] = useState(false);
  const [emergencyUpgradeOpen, setEmergencyUpgradeOpen] = useState(false);
  const { activePet, pets, setActivePet, isLoading: petsLoading, hasPets } = usePets();
  const { records, isLoading: recordsLoading, createRecord, updateRecord, deleteRecord } =
    useHealthRecords();
  const { documents, isLoading: documentsLoading } = useDocuments();
  const { checkIns } = useDailyCheckIn();
  const {
    passport: emergencyPassport,
    ensureLink,
  } = useEmergencyPassport(activePet, records);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [defaultRecordType, setDefaultRecordType] = useState<HealthRecordType | undefined>();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const passport = useMemo(
    () =>
      activePet
        ? buildPassportSummary(
            activePet,
            records.filter((r) => r.petId === activePet.id),
            documents.filter((d) => d.petId === activePet.id),
            checkIns.filter((c) => c.petId === activePet.id),
            emergencyPassport && !emergencyPassport.revokedAt
              ? emergencyPassport.publicToken
              : null,
          )
        : null,
    [activePet, records, documents, checkIns, emergencyPassport],
  );

  const publicShareUrl = useMemo(() => {
    if (!emergencyPassport || emergencyPassport.revokedAt) return null;
    return buildPublicEmergencyUrl(emergencyPassport.publicToken);
  }, [emergencyPassport]);

  useEffect(() => {
    if (passportAccess.isAllowed && activePet && !emergencyPassport) {
      void ensureLink().catch(() => undefined);
    }
  }, [passportAccess.isAllowed, activePet?.id, emergencyPassport, ensureLink]);

  useEffect(() => {
    if (passport) track('passport_viewed');
  }, [track, passport]);

  const handleDownload = useCallback(async () => {
    const node = exportRef.current;
    if (!node || !passport) return;
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportNodeToPng(node, 2);
      const safeName = passport.identity.petName.replace(/[^\w.-]+/g, '_').slice(0, 40);
      await downloadBlob(blob, `${safeName}-emergency-passport.png`);
      track('passport_exported', { petName: passport.identity.petName });
    } catch (err) {
      setExportError(getUserFacingError(err, 'export', 'Download failed. Please try again.'));
    } finally {
      setExporting(false);
    }
  }, [passport, track]);

  const openAdd = useCallback(
    (type: HealthRecordType) => {
      if (
        !canCreateHealthRecord(
          {
            subscriptionStatus: user?.subscriptionStatus,
            subscriptionTier: user?.subscriptionTier ?? 'free',
          },
          records.length,
        )
      ) {
        setHealthUpgradeOpen(true);
        return;
      }
      setEditingRecord(null);
      setDefaultRecordType(type);
      setHealthModalOpen(true);
    },
    [user?.subscriptionStatus, user?.subscriptionTier, records.length],
  );

  const openEdit = useCallback((record: HealthRecord) => {
    setEditingRecord(record);
    setDefaultRecordType(undefined);
    setHealthModalOpen(true);
  }, []);

  const handleHealthSubmit = async (input: CreateHealthRecordInput, recordId?: string) => {
    if (recordId) {
      await updateRecord(recordId, input);
    } else {
      await createRecord(input);
    }
  };

  const isLoading = petsLoading || recordsLoading || documentsLoading;

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.loading}>
          <LoadingState message="Loading passport" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !passport || !activePet) {
    return (
      <AppLayout flushContent>
        <div className={styles.loading}>
          <EmptyPetProfileState />
        </div>
      </AppLayout>
    );
  }

  const { identity } = passport;
  const photo = identity.photo || PET_PORTRAIT_PLACEHOLDER;
  const ownerName = user?.name ?? 'Pet owner';
  const ownerEmail = user?.email ?? 'Not set';
  const hasPremiumPassport = passportAccess.isAllowed;
  const heroPetPhoto = identity.photo || null;

  const medicalAndToolsContent = (
    <>
      <section className="ed-chapter" aria-label="Critical medical">
        <div className="ed-chapter__intro">
          <p className="ed-eyebrow">Critical first</p>
          <h2 className="ed-title">What a vet needs in seconds</h2>
        </div>
        <div className={styles.blockStack}>
          <PassportRecordBlock
            title="Critical allergies"
            records={passport.allergies}
            emptyMessage="No allergies on file — add known reactions for safer care."
            variant="critical"
            onAdd={() => openAdd('allergy')}
            onEdit={openEdit}
          />
          <PassportRecordBlock
            title="Active medications"
            records={passport.medications}
            emptyMessage="No medications recorded."
            onAdd={() => openAdd('medication')}
            onEdit={openEdit}
          />
        </div>
      </section>

      <section className="ed-chapter" aria-label="Care context">
        <div className="ed-chapter__intro">
          <p className="ed-eyebrow">Care context</p>
          <h2 className="ed-title">Weight & recent routine</h2>
        </div>
        <div className={styles.blockStack}>
          <PassportWeightBlock
            passport={passport}
            onAdd={() => openAdd('weight')}
            onEdit={openEdit}
          />
          <PassportDailyCareBlock passport={passport} />
        </div>
      </section>

      <section className="ed-chapter" aria-label="Emergency contacts">
        <div className="ed-chapter__intro">
          <p className="ed-eyebrow">Who to call</p>
          <h2 className="ed-title">Emergency contacts</h2>
        </div>
        <div className={styles.recordBlock}>
          <div className={styles.contactItem}>
            <p className={styles.contactName}>{ownerName}</p>
            <p className={styles.contactMeta}>Primary owner · {ownerEmail}</p>
          </div>
          <div className={styles.contactItem}>
            <p className={styles.contactName}>Veterinary clinic</p>
            <p className={styles.contactMeta}>
              Add your vet&apos;s details in health records for faster emergency routing.
            </p>
          </div>
        </div>
      </section>

      <section className="ed-band" aria-label="Premium tools">
        <div className="ed-band__texture" aria-hidden />
        <span className="ed-band__watermark" aria-hidden>
          Carry it
        </span>
        <div className="ed-band__inner">
          <p className="ed-eyebrow">Take it anywhere</p>
          <h2 className="ed-band__title">Export, share & emergency mode</h2>
          <p className="ed-band__text">
            One tap turns {identity.petName}&apos;s record into a print-ready sheet or a secure link
            for sitters and clinicians.
          </p>
          <PremiumPassportTools
            passport={passport}
            exportRef={exportRef}
            onExport={() => void handleDownload()}
            exporting={exporting}
            exportError={exportError}
            hasEmergencyMode={emergencyModeAccess.isAllowed}
            onEmergencyModeUpgrade={() => setEmergencyUpgradeOpen(true)}
            publicShareUrl={publicShareUrl}
          />
        </div>
      </section>
    </>
  );

  return (
    <AppLayout flushContent>
      <div className="ed-page">
        <header className="ed-hero">
          <img
            className={`ed-hero__bg ${heroPetPhoto ? 'ed-hero__bg--pet' : ''}`}
            src={photo}
            alt=""
            aria-hidden
          />
          <div className="ed-hero__wash" aria-hidden />
          <div className="ed-hero__texture" aria-hidden />
          <div className="ed-hero__inner">
            <div className="ed-hero__top">
              <PetSwitcherHero pets={pets} activeId={activePet.id} onSelect={setActivePet} />
            </div>
            <div className="ed-hero__grid">
              <div className="ed-hero__text">
                <p className="ed-hero__kicker">Official medical ID</p>
                <h1 className="ed-hero__title">Emergency Passport</h1>
                <p className="ed-hero__subtitle">
                  A print-ready identity and care summary for {identity.petName} — built for travel,
                  boarding, and the moments that matter most.
                </p>
                {hasPremiumPassport && (
                  <div className="ed-hero__cta">
                    <button
                      type="button"
                      className="ed-btn"
                      onClick={() => void handleDownload()}
                      disabled={exporting}
                    >
                      {exporting ? 'Preparing…' : 'Export passport'}
                    </button>
                    <a href="#identity" className="ed-btn-ghost">
                      View record
                    </a>
                  </div>
                )}
              </div>
              <div className="ed-hero__portrait" aria-hidden>
                <img src={photo} alt="" />
              </div>
            </div>
          </div>
        </header>

        <div className="ed-body">
          <section className="ed-chapter" id="identity" aria-label="Identity">
            <article className={styles.identityCard}>
              <div className={styles.identityPortrait}>
                <img src={photo} alt={identity.petName} />
              </div>
              <div>
                <p className={styles.identityKicker}>PetClues · Identity</p>
                <h2 className={styles.identityName}>{identity.petName}</h2>
                <dl className={styles.identityDl}>
                  <div>
                    <dt className={styles.dlTerm}>Species</dt>
                    <dd className={styles.dlDef}>{identity.species}</dd>
                  </div>
                  <div>
                    <dt className={styles.dlTerm}>Breed</dt>
                    <dd className={styles.dlDef}>{identity.breed}</dd>
                  </div>
                  <div>
                    <dt className={styles.dlTerm}>Age</dt>
                    <dd className={styles.dlDef}>{identity.age}</dd>
                  </div>
                  {identity.weight && (
                    <div>
                      <dt className={styles.dlTerm}>Weight</dt>
                      <dd className={styles.dlDef}>{identity.weight}</dd>
                    </div>
                  )}
                </dl>
                <p className={styles.identityUpdated}>Updated {identity.lastUpdated}</p>
              </div>
            </article>
          </section>

          {hasPremiumPassport ? (
            medicalAndToolsContent
          ) : (
            <section className="ed-chapter">
              <PremiumGate
                requiredTier="Plus"
                title="Secure Your Pet's Passport"
                description="Upgrade to Plus to unlock medical records, emergency contacts, print-ready sheets, and shareable care safety links for pet sitters or clinicians."
                className="!min-h-[20rem]"
              >
                <PassportMedicalGatePreview />
              </PremiumGate>
            </section>
          )}

          <footer className="ed-footnote">
            <hr />
            <p>PetClues Emergency Passport · {identity.petName}</p>
            <HealthDisclaimerNote compact />
          </footer>
        </div>

        <HealthRecordModal
          record={editingRecord}
          isOpen={healthModalOpen}
          onClose={() => setHealthModalOpen(false)}
          onSubmit={handleHealthSubmit}
          onDelete={deleteRecord}
          defaultRecordType={defaultRecordType}
        />

        <UpgradeModal
          isOpen={healthUpgradeOpen}
          onClose={() => setHealthUpgradeOpen(false)}
        />
        <EditorialUpgradeModal
          isOpen={emergencyUpgradeOpen}
          onClose={() => setEmergencyUpgradeOpen(false)}
          eyebrow="PetClues Pro"
          title="One-Click Emergency Mode"
          description="Upgrade to Pro to pin critical allergies and medications to a lock-screen summary for pet sitters and emergency clinicians."
          requiredTier="Pro"
        />
      </div>
    </AppLayout>
  );
}

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
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { buildPassportSummary, formatPassportRecordLine } from '@/services/passport/passportService';
import type { CreateHealthRecordInput } from '@/services/healthRecords/healthRecordService';
import type { HealthRecord, HealthRecordType } from '@/services/healthRecords/healthRecordTypes';
import { UpgradeModal } from '@/components/subscription';
import { EditorialUpgradeModal } from '@/components/ui';
import { getUserFacingError } from '@/utils/userFacingErrors';

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
  return (
    <section
      className={`border p-5 sm:p-6 ${
        variant === 'critical'
          ? 'border-red-200/70 bg-red-50/30'
          : 'border-stone-200/70 bg-white/50'
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl text-stone-900">{title}</h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="font-sans text-[10px] uppercase tracking-[0.18em] text-stone-500 hover:text-stone-800"
          >
            Add
          </button>
        )}
      </div>
      {records.length === 0 ? (
        <p className="font-sans text-sm text-stone-400">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-stone-100">
          {records.map((record) => (
            <li key={record.id} className="py-3 first:pt-0 last:pb-0">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => onEdit?.(record)}
              >
                <p className="font-sans text-sm text-stone-800">
                  {formatPassportRecordLine(record)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Placeholder medical blocks inside PremiumGate — no real user health data */
function PassportMedicalGatePreview() {
  return (
    <div className="space-y-10">
      <div className="grid gap-5 sm:grid-cols-2">
        <PassportRecordBlock
          title="Critical allergies"
          records={[]}
          emptyMessage="No allergies on file — add known reactions for safer care."
          variant="critical"
        />
        <PassportRecordBlock
          title="Active medications"
          records={[]}
          emptyMessage="No medications recorded."
        />
      </div>

      <section className="border border-stone-200/70 bg-white/50 p-5 sm:p-6">
        <h3 className="font-serif text-xl text-stone-900">Emergency contacts</h3>
        <ul className="mt-4 divide-y divide-stone-100">
          <li className="py-3">
            <p className="font-sans text-sm font-medium text-stone-800">Primary owner</p>
            <p className="font-sans text-xs text-stone-500">Add your contact details for emergency routing.</p>
          </li>
          <li className="py-3">
            <p className="font-sans text-sm font-medium text-stone-800">Veterinary clinic</p>
            <p className="font-sans text-xs text-stone-500">
              Add your vet&apos;s details in health records for faster emergency routing.
            </p>
          </li>
        </ul>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-stone-200/70 bg-white/60 p-5">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">Export</p>
          <p className="mt-2 font-serif text-xl text-stone-900">Print-ready PDF sheet</p>
        </div>
        <div className="border border-stone-200/70 bg-white/60 p-5">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">Share</p>
          <p className="mt-2 font-serif text-xl text-stone-900">Public care link</p>
        </div>
      </div>
    </div>
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
}: {
  passport: ReturnType<typeof buildPassportSummary>;
  exportRef: RefObject<HTMLDivElement | null>;
  onExport: () => void;
  exporting: boolean;
  exportError: string | null;
  hasEmergencyMode: boolean;
  onEmergencyModeUpgrade: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const link = passport.identity.secureLink;

  const handleCopy = async () => {
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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="border border-stone-200/70 bg-white/60 p-5 text-left transition-colors hover:bg-white disabled:opacity-60"
        >
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">
            Export
          </p>
          <p className="mt-2 font-serif text-xl text-stone-900">Print-ready PDF sheet</p>
          <p className="mt-2 font-sans text-sm text-stone-500">
            Download a high-resolution PNG for travel, boarding, or clinics.
          </p>
          {exporting && (
            <p className="mt-2 font-sans text-xs text-stone-400">Preparing download…</p>
          )}
        </button>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="border border-stone-200/70 bg-white/60 p-5 text-left transition-colors hover:bg-white"
        >
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">
            Share
          </p>
          <p className="mt-2 font-serif text-xl text-stone-900">Public care link</p>
          <p className="mt-2 truncate font-sans text-xs text-stone-400">{link}</p>
          {copied && (
            <p className="mt-2 font-sans text-xs text-stone-600">Link copied</p>
          )}
        </button>
      </div>

      {hasEmergencyMode ? (
        <article className="border border-amber-200/60 bg-amber-50/40 p-6">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-amber-800/70">
            Emergency mode
          </p>
          <h3 className="mt-2 font-serif text-2xl text-stone-900">Activate rapid handoff</h3>
          <p className="mt-2 font-sans text-sm leading-relaxed text-stone-600">
            Pin critical allergies and medications to your lock screen summary for pet sitters and
            emergency clinicians.
          </p>
          <button
            type="button"
            className="mt-5 border border-stone-900 bg-stone-900 px-5 py-2.5 font-sans text-xs uppercase tracking-[0.2em] text-stone-50"
          >
            Enable emergency mode
          </button>
        </article>
      ) : (
        <article className="border border-stone-200/70 bg-white/50 p-6">
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">
            Emergency mode · Pro
          </p>
          <h3 className="mt-2 font-serif text-2xl text-stone-900">Activate rapid handoff</h3>
          <p className="mt-2 font-sans text-sm leading-relaxed text-stone-500">
            Upgrade to Pro to pin critical allergies and medications to a lock-screen summary for
            pet sitters and emergency clinicians.
          </p>
          <button
            type="button"
            onClick={onEmergencyModeUpgrade}
            className="mt-5 border border-stone-900 bg-stone-900 px-5 py-2.5 font-sans text-xs uppercase tracking-[0.2em] text-stone-50"
          >
            Upgrade to Pro
          </button>
        </article>
      )}

      {exportError && (
        <p className="font-sans text-sm text-red-700" role="alert">
          {exportError}
        </p>
      )}

      <PassportExportSheet ref={exportRef} passport={passport} />
    </div>
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
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [defaultRecordType, setDefaultRecordType] = useState<HealthRecordType | undefined>();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const passport = useMemo(
    () => (activePet ? buildPassportSummary(activePet, records, documents) : null),
    [activePet, records, documents],
  );

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
        <div className="mx-auto w-full max-w-3xl px-6 py-20">
          <LoadingState message="Loading passport" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !passport || !activePet) {
    return (
      <AppLayout flushContent>
        <div className="mx-auto w-full max-w-3xl px-6 py-20">
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

  const medicalAndToolsContent = (
    <>
      <div className="mb-10 grid gap-5 sm:grid-cols-2">
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

      <section className="mb-10 border border-stone-200/70 bg-white/50 p-5 sm:p-6">
        <h3 className="font-serif text-xl text-stone-900">Emergency contacts</h3>
        <ul className="mt-4 divide-y divide-stone-100">
          <li className="py-3">
            <p className="font-sans text-sm font-medium text-stone-800">{ownerName}</p>
            <p className="font-sans text-xs text-stone-500">Primary owner · {ownerEmail}</p>
          </li>
          <li className="py-3">
            <p className="font-sans text-sm font-medium text-stone-800">Veterinary clinic</p>
            <p className="font-sans text-xs text-stone-500">
              Add your vet&apos;s details in health records for faster emergency routing.
            </p>
          </li>
        </ul>
      </section>

      <section className="border-t border-stone-200/60 pt-10">
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone-400">
          Premium tools
        </p>
        <h2 className="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl">
          Export, share &amp; emergency mode
        </h2>
        <div className="mt-8">
          <PremiumPassportTools
            passport={passport}
            exportRef={exportRef}
            onExport={() => void handleDownload()}
            exporting={exporting}
            exportError={exportError}
            hasEmergencyMode={emergencyModeAccess.isAllowed}
            onEmergencyModeUpgrade={() => setEmergencyUpgradeOpen(true)}
          />
        </div>
      </section>
    </>
  );

  return (
    <AppLayout flushContent>
      <div className="overflow-x-hidden">
        <div className="mx-auto w-full max-w-3xl px-6 pb-20 pt-8 sm:px-8 sm:pt-12">
          <div className="relative mb-10">
            <PetSwitcherHero
              pets={pets}
              activeId={activePet.id}
              onSelect={setActivePet}
            />
          </div>

          <header className="mb-10 text-center">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone-400">
              Official medical ID
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl">
              Emergency Passport
            </h1>
            <p className="mx-auto mt-4 max-w-lg font-sans text-sm leading-relaxed text-stone-500">
              A print-ready identity and care summary for travel, boarding, and emergency handoffs.
            </p>
          </header>

          <article className="mb-10 border border-stone-300 bg-gradient-to-br from-stone-50 to-white p-6 shadow-[0_20px_60px_rgba(28,25,23,0.06)] sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="mx-auto shrink-0 border-4 border-white bg-stone-100 shadow-md sm:mx-0">
                <img
                  src={photo}
                  alt={identity.petName}
                  className="h-36 w-28 object-cover sm:h-44 sm:w-32"
                />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-stone-400">
                  PetClues · Identity
                </p>
                <h2 className="mt-2 font-serif text-3xl text-stone-900">{identity.petName}</h2>
                <dl className="mt-4 grid gap-2 font-sans text-sm text-stone-600 sm:grid-cols-2">
                  <div>
                    <dt className="text-stone-400">Species</dt>
                    <dd>{identity.species}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-400">Breed</dt>
                    <dd>{identity.breed}</dd>
                  </div>
                  <div>
                    <dt className="text-stone-400">Age</dt>
                    <dd>{identity.age}</dd>
                  </div>
                  {identity.weight && (
                    <div>
                      <dt className="text-stone-400">Weight</dt>
                      <dd>{identity.weight}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-4 font-sans text-xs text-stone-400">
                  Updated {identity.lastUpdated}
                </p>
              </div>
            </div>
          </article>

          {hasPremiumPassport ? (
            medicalAndToolsContent
          ) : (
            <PremiumGate
              requiredTier="Plus"
              title="Secure Your Pet's Passport"
              description="Upgrade to Plus to unlock medical records, emergency contacts, print-ready sheets, and shareable care safety links for pet sitters or clinicians."
              className="!min-h-[20rem]"
            >
              <PassportMedicalGatePreview />
            </PremiumGate>
          )}

          <footer className="mt-12 border-t border-stone-200/60 pt-8">
            <p className="font-sans text-xs text-stone-400">
              <strong className="text-stone-600">PetClues Emergency Passport</strong> ·{' '}
              {identity.petName}
            </p>
            <div className="mt-4">
              <HealthDisclaimerNote compact />
            </div>
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

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState, PageContainer, PremiumGate } from '@/components/ui';
import { GatedPagePreview } from '@/components/premium/GatedPagePreview';
import { PetSwitcherHero } from '@/components/pets';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { ROUTES } from '@/routes/paths';

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
    <div className="space-y-8">
      <article className="border border-stone-200/70 bg-white/60 p-6 sm:p-8">
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone-400">
          Clinician view · read-only
        </p>
        <h2 className="mt-2 font-serif text-2xl text-stone-900 sm:text-3xl">
          {petName}&apos;s structured history
        </h2>
        <p className="mt-3 font-sans text-sm leading-relaxed text-stone-500">
          Secure link preview — chronological medical events, documents, and care notes as your
          veterinary team would see them.
        </p>
        <dl className="mt-6 grid gap-4 border-t border-stone-100 pt-6 sm:grid-cols-3">
          <div>
            <dt className="font-sans text-xs text-stone-400">Health records</dt>
            <dd className="font-serif text-2xl text-stone-900">{records.length}</dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-stone-400">Documents</dt>
            <dd className="font-serif text-2xl text-stone-900">{documentCount}</dd>
          </div>
          <div>
            <dt className="font-sans text-xs text-stone-400">Access mode</dt>
            <dd className="font-sans text-sm text-stone-700">Live sync · view only</dd>
          </div>
        </dl>
      </article>

      <section>
        <h3 className="mb-4 font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">
          Chronological timeline
        </h3>
        {sorted.length === 0 ? (
          <p className="font-sans text-sm text-stone-500">
            No health records yet — add vaccinations, medications, and visit notes to populate this
            view.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200/70 border border-stone-200/60 bg-white/40">
            {sorted.map((record) => (
              <li key={record.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <time
                  className="font-sans text-xs tabular-nums text-stone-500"
                  dateTime={record.dateRecorded}
                >
                  {formatHealthRecordDate(record.dateRecorded)}
                </time>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-stone-400">
                    {RECORD_TYPE_LABEL[record.recordType] ?? record.recordType}
                  </p>
                  <p className="mt-1 font-serif text-lg text-stone-900">{record.title}</p>
                  {record.description && (
                    <p className="mt-1 font-sans text-sm leading-relaxed text-stone-500">
                      {record.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <article className="border border-stone-200/70 bg-stone-50/50 p-6">
        <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-stone-400">
          Secure link
        </p>
        <p className="mt-2 font-mono text-xs text-stone-600 break-all">
          https://petclues.app/vet/{petName.toLowerCase().replace(/\s+/g, '-')}-●●●●
        </p>
        <p className="mt-3 font-sans text-xs text-stone-400">
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
        <div className="mx-auto w-full max-w-4xl px-6 py-20">
          <LoadingState message="Loading vet portal" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet) {
    return (
      <AppLayout flushContent>
        <div className="mx-auto w-full max-w-4xl px-6 py-20 text-center">
          <h1 className="font-serif text-4xl text-stone-900">Vet Collaboration</h1>
          <p className="mt-4 font-sans text-sm text-stone-500">
            Add a pet profile to generate secure clinical sharing links.
          </p>
          <Link
            to={ROUTES.PET_PROFILE}
            className="mt-6 inline-block font-sans text-xs uppercase tracking-[0.2em] text-stone-800 underline-offset-4 hover:underline"
          >
            Go to pet profile →
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!vetAccess.isAllowed) {
    return (
      <AppLayout flushContent>
        <PageContainer size="lg" className="mx-auto w-full px-6 py-12 sm:py-16">
          <PremiumGate
            requiredTier="Pro"
            title="Live Veterinary Sync"
            description="Pro members can generate secure, read-only live web links for veterinary clinics, giving doctors instant access to structured, chronological medical histories."
            className="!min-h-[28rem]"
          >
            <GatedPagePreview
              imageUrl={VET_HERO_IMAGE}
              eyebrow="Clinical collaboration"
              title="Vet Collaboration Portal"
              subtitle="Warm, read-only access for the clinicians who care for your companion."
            />
          </PremiumGate>
          <div className="mt-12 border-t border-stone-200/60 pt-8">
            <HealthDisclaimerNote compact />
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  const dashboard = (
    <VetReadOnlyDashboard
      petName={activePet.name}
      records={petRecords}
      documentCount={petDocuments.length}
    />
  );

  return (
    <AppLayout flushContent>
      <div className="overflow-x-hidden">
        <header className="relative min-h-[20rem] sm:min-h-[24rem]">
          <img
            src={VET_HERO_IMAGE}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-stone-900/25"
            aria-hidden
          />
          <div className="relative mx-auto flex min-h-[20rem] max-w-4xl flex-col justify-end px-6 pb-10 pt-24 sm:min-h-[24rem] sm:px-8 sm:pb-14">
            <PetSwitcherHero
              pets={pets}
              activeId={activePet.id}
              onSelect={setActivePet}
            />
            <p className="mt-8 font-sans text-[11px] uppercase tracking-[0.24em] text-stone-300">
              Clinical collaboration
            </p>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-white sm:text-5xl">
              Vet Collaboration Portal
            </h1>
            <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-stone-200">
              Warm, read-only access for the clinicians who care for {activePet.name}.
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-8 sm:py-16">
          {dashboard}

          <div className="mt-12 border-t border-stone-200/60 pt-8">
            <HealthDisclaimerNote compact />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

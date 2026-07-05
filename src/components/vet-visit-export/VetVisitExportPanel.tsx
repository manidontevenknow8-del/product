import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PremiumGate } from '@/components/ui';
import { EditorialUpgradeModal } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { ROUTES } from '@/routes/paths';
import {
  buildVetVisitExportData,
  exportVetVisitPdf,
  getVetVisitExportService,
} from '@/services/vetVisitExport';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import type { DailyCheckIn } from '@/types/dailyCheckIn';
import type { SymptomLog } from '@/services/symptomLog';
import { getUserFacingError } from '@/utils/userFacingErrors';
import { VetVisitExportSheet } from './VetVisitExportSheet';
import styles from './VetVisitExportPanel.module.css';

type VetVisitExportPanelProps = {
  pet: PetRecord;
  records: HealthRecord[];
  checkIns: DailyCheckIn[];
  symptomLogs?: SymptomLog[];
};

export function VetVisitExportPanel({ pet, records, checkIns, symptomLogs = [] }: VetVisitExportPanelProps) {
  const { user } = useAuth();
  const { currentPlan, refresh } = useSubscription();
  const exportAccess = useFeatureAccess('vetVisitExport');
  const exportRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const petRecords = useMemo(
    () => records.filter((record) => record.petId === pet.id),
    [records, pet.id],
  );
  const petCheckIns = useMemo(
    () => checkIns.filter((checkIn) => checkIn.petId === pet.id),
    [checkIns, pet.id],
  );
  const exportData = useMemo(
    () => buildVetVisitExportData(pet, petRecords, petCheckIns, symptomLogs),
    [pet, petRecords, petCheckIns, symptomLogs],
  );

  const usageLabel =
    exportAccess.usageLimit === 'unlimited'
      ? 'Unlimited exports on your plan'
      : `${exportAccess.currentUsage}/${exportAccess.usageLimit} export${exportAccess.usageLimit === 1 ? '' : 's'} used this month`;

  const openFlow = () => {
    if (!exportAccess.isAllowed) {
      setUpgradeOpen(true);
      return;
    }
    setError(null);
    setModalOpen(true);
  };

  const handleExport = async () => {
    if (!user?.id) {
      setError('Please sign in to export.');
      return;
    }

    const node = exportRef.current;
    if (!node) {
      setError('Export layout is not ready. Try again.');
      return;
    }

    setExporting(true);
    setError(null);

    try {
      await getVetVisitExportService().reserveExport(user.id, pet.id, currentPlan);
      const safeName = pet.name.replace(/[^\w.-]+/g, '_').slice(0, 40);
      const dateStamp = new Date().toISOString().slice(0, 10);
      await exportVetVisitPdf(node, `${safeName}-vet-visit-${dateStamp}.pdf`);
      await refresh();
      setModalOpen(false);
    } catch (err) {
      setError(getUserFacingError(err, 'export', 'Could not create the vet visit PDF.'));
    } finally {
      setExporting(false);
    }
  };

  if (!exportAccess.isAllowed && currentPlan === 'free') {
    return (
      <section className={styles.wrap}>
        <PremiumGate
          requiredTier="Plus"
          title="Export for a vet visit"
          description="Upgrade to Plus to download a dated PDF summary of vaccinations, medications, allergies, weight trends, and wellness notes."
        >
          <div>
            <p className={styles.title}>Prepare for a vet visit</p>
            <p className={styles.lead}>
              Share your pet&apos;s own records outward — separate from Scan&apos;s incoming bill
              decoder.
            </p>
          </div>
        </PremiumGate>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-labelledby="vet-visit-export-title">
      <div className={styles.head}>
        <div>
          <p className={styles.kicker}>Outgoing visit packet</p>
          <h3 id="vet-visit-export-title" className={styles.title}>
            Prepare for a vet visit
          </h3>
          <p className={styles.lead}>
            Download a clean, dated PDF of {pet.name}&apos;s vaccinations, medications, allergies,
            90-day weight trend, recent symptom logs, and wellness notes — built from records you&apos;ve already
            saved.
          </p>
          <p className={styles.distinction}>
            <strong>Not the bill decoder.</strong> This exports your pet&apos;s history to bring to
            an appointment. To read an incoming invoice, use{' '}
            <Link to={ROUTES.SCAN}>Scan → Decode a vet bill</Link>.
          </p>
          {exportAccess.usageLimit !== 'unlimited' && (
            <p className={styles.usage}>{usageLabel}</p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={exporting}
          onClick={openFlow}
        >
          Export for a vet visit
        </button>
        {!exportAccess.isAllowed && currentPlan === 'plus' && (
          <button type="button" className={styles.secondaryBtn} onClick={() => setUpgradeOpen(true)}>
            Upgrade for unlimited
          </button>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <VetVisitExportSheet ref={exportRef} data={exportData} />

      {modalOpen && (
        <div className={styles.modalBackdrop} role="presentation" onClick={() => !exporting && setModalOpen(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-labelledby="vet-visit-export-modal-title"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="vet-visit-export-modal-title" className={styles.modalTitle}>
              Export for a vet visit
            </h2>
            <p className={styles.modalLead}>
              We&apos;ll create a PDF for {pet.name} with the sections below.
              {exportAccess.usageLimit === 'unlimited'
                ? ' Unlimited exports on your plan.'
                : ` This uses one export credit on Plus (${usageLabel}).`}
            </p>
            <ul className={styles.modalList}>
              <li>Vaccination history</li>
              <li>Current medications</li>
              <li>Known allergies</li>
              <li>Weight trend summary (last 90 days)</li>
              <li>Recent symptom logs</li>
              <li>Recent wellness notes</li>
            </ul>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={exporting}
                onClick={() => void handleExport()}
              >
                {exporting ? 'Preparing PDF…' : 'Download PDF'}
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                disabled={exporting}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      )}

      <EditorialUpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        eyebrow="PetClues Plus"
        title={currentPlan === 'free' ? 'Export for a vet visit' : 'Unlimited vet visit exports'}
        description={
          currentPlan === 'free'
            ? 'Plus includes one outgoing vet visit PDF per month. Pro unlocks unlimited exports.'
            : 'You have used your monthly vet visit export on Plus. Upgrade to Pro for unlimited PDFs.'
        }
        requiredTier={currentPlan === 'free' ? 'Plus' : 'Pro'}
      />
    </section>
  );
}

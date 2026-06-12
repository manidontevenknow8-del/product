import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { EditorialUpgradeModal, LoadingState, PremiumGate } from '@/components/ui';
import { DOCUMENT_VAULT_LIMIT_MESSAGE } from '@/documents';
import {
  DecoderUsageBar,
  RecentScansHistory,
  ScanMagicDropzone,
  UploadSuccessCard,
  VetBillDecoderReview,
  recordToHistoryItem,
  type ScanMagicDropzoneHandle,
} from '@/components/scan';
import { UpgradeModal } from '@/components/subscription';
import { useAuth } from '@/auth/AuthProvider';
import { useDocuments } from '@/documents';
import { useHealthRecords } from '@/healthRecords';
import { useReminders } from '@/reminders';
import { usePets } from '@/pets';
import { PetSwitcher } from '@/components/pets';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { useAnalytics } from '@/analytics';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { formatFileTypeLabel } from '@/services/documents/documentService';
import { getHealthRecordService } from '@/services/healthRecords/healthRecordService';
import { getReminderService } from '@/services/reminders/reminderService';
import { getUserFacingError } from '@/utils/userFacingErrors';
import {
  applyApprovedExtraction,
  getVetBillDecoderService,
  isVetBillDecoderMockMode,
  normalizeExtractionStatus,
  resolveReviewStatus,
  type VetBillExtractionRecord,
  type VetBillExtractionResult,
} from '@/services/vetBillDecoder';
import styles from './ScanPage.module.css';

type DecodeState = 'idle' | 'decoding' | 'report' | 'error';

function resultForRecord(record: VetBillExtractionRecord): VetBillExtractionResult {
  return record.approvedSnapshot ?? record.extractionResult;
}

export function ScanPage() {
  const { track } = useAnalytics();
  const { user } = useAuth();
  const { currentPlan } = useSubscription();
  const decoderAccess = useFeatureAccess('vetBillDecoder');
  const documentAccess = useFeatureAccess('documents');
  const timelineAccess = useFeatureAccess('timelineHistory');
  const uploadRef = useRef<ScanMagicDropzoneHandle>(null);
  const decoderService = useMemo(() => getVetBillDecoderService(), []);
  const { activePet, pets, setActivePet, isLoading: petsLoading, hasPets } = usePets();
  const { refreshRecords } = useHealthRecords();
  const { refresh: refreshReminders } = useReminders();
  const {
    documents,
    isLoading: docsLoading,
    uploadState,
    uploadProgress,
    uploadError,
    lastUploaded,
    uploadDocument,
    deleteDocument,
    resetUploadState,
  } = useDocuments();

  const [decodeState, setDecodeState] = useState<DecodeState>('idle');
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [activeExtraction, setActiveExtraction] = useState<VetBillExtractionRecord | null>(null);
  const [reviewResult, setReviewResult] = useState<VetBillExtractionResult | null>(null);
  const [history, setHistory] = useState<VetBillExtractionRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [documentUpgradeOpen, setDocumentUpgradeOpen] = useState(false);

  const decoderMockMode = isVetBillDecoderMockMode();
  const isEnterprise = currentPlan === 'enterprise';
  const isMonthlyDecoderQuota = currentPlan === 'plus' || currentPlan === 'pro';
  const quotaExhausted = !decoderAccess.isAllowed;
  const documentVaultFull = !documentAccess.isAllowed;

  const loadHistory = useCallback(async () => {
    if (!user?.id || !activePet?.id) {
      setHistory([]);
      return;
    }
    const records = await decoderService.listExtractions(user.id, activePet.id);
    setHistory(records);
  }, [decoderService, user?.id, activePet?.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    resetUploadState();
    setDecodeState('idle');
    setActiveExtraction(null);
    setReviewResult(null);
    setDecodeError(null);
  }, [activePet?.id, resetUploadState]);

  const historyItems = useMemo(
    () =>
      history.map((record) => {
        const fileName =
          documents.find((d) => d.id === record.documentId)?.fileName ?? 'Document';
        return recordToHistoryItem(record, fileName);
      }),
    [history, documents],
  );

  const openReport = useCallback((record: VetBillExtractionRecord, scroll = true) => {
    const normalized: VetBillExtractionRecord = {
      ...record,
      status: normalizeExtractionStatus(record.status),
    };
    setActiveExtraction(normalized);
    setReviewResult(resultForRecord(normalized));
    setDecodeState('report');
    setDecodeError(null);
    if (scroll) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }, []);

  const runDecode = useCallback(
    async (documentId: string, fileName: string) => {
      if (!user?.id || !activePet?.id) return;
      if (!decoderAccess.isAllowed) {
        setUpgradeOpen(true);
        return;
      }

      const cached = await decoderService.getExtractionByDocumentId(
        user.id,
        activePet.id,
        documentId,
      );

      if (cached) {
        openReport(cached);
        return;
      }

      setDecodeState('decoding');
      setDecodeError(null);
      try {
        const record = await decoderService.decodeDocument(
          user.id,
          activePet.id,
          documentId,
          fileName,
        );
        openReport(record);
        track('vet_bill_decoded', { documentId, model: record.modelUsed ?? 'unknown' });
        await loadHistory();
      } catch (err) {
        setDecodeState('error');
        const message = getUserFacingError(err, 'decode', 'Decoder failed.');
        if (message.includes('Premium') || message.includes('premium_required')) {
          setUpgradeOpen(true);
        }
        setDecodeError(message);
      }
    },
    [user?.id, activePet?.id, decoderAccess.isAllowed, decoderService, openReport, track, loadHistory],
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!activePet) return;
      if (documentVaultFull) {
        setDocumentUpgradeOpen(true);
        return;
      }
      if (quotaExhausted) return;
      resetUploadState();
      setActiveExtraction(null);
      setReviewResult(null);

      try {
        const document = await uploadDocument(file);
        track('document_uploaded', {
          documentType: formatFileTypeLabel(document.fileType),
        });
        await runDecode(document.id, document.fileName);
      } catch {
        // uploadDocument sets error state
      }
    },
    [activePet, documentVaultFull, quotaExhausted, uploadDocument, resetUploadState, track, runDecode],
  );

  const persistReportSnapshot = async () => {
    if (!user?.id || !activeExtraction || !reviewResult) return;
    await decoderService.updateExtractionReview(
      user.id,
      activeExtraction.id,
      reviewResult,
      activeExtraction.status === 'approved' || activeExtraction.status === 'partially_approved'
        ? activeExtraction.status
        : 'saved',
    );
    await loadHistory();
  };

  const handleAddToTimeline = async () => {
    if (!user?.id || !activePet || !activeExtraction || !reviewResult) return;
    setIsSaving(true);
    setDecodeError(null);
    try {
      const status = resolveReviewStatus(reviewResult);
      await applyApprovedExtraction({
        ownerId: user.id,
        petId: activePet.id,
        petName: activePet.name,
        documentId: activeExtraction.documentId,
        result: reviewResult,
        healthRecordService: getHealthRecordService(),
        reminderService: getReminderService(),
      });
      await decoderService.updateExtractionReview(
        user.id,
        activeExtraction.id,
        reviewResult,
        status,
      );
      track('vet_bill_approved', {
        extractionId: activeExtraction.id,
        status,
      });
      await Promise.all([refreshRecords(), refreshReminders(), loadHistory()]);
      const updated: VetBillExtractionRecord = {
        ...activeExtraction,
        status,
        approvedSnapshot: reviewResult,
        reviewedAt: new Date().toISOString(),
      };
      openReport(updated);
    } catch (err) {
      setDecodeError(getUserFacingError(err, 'decode', 'Failed to add items to timeline.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseReport = async () => {
    try {
      await persistReportSnapshot();
    } catch {
      // still close locally
    }
    setActiveExtraction(null);
    setReviewResult(null);
    setDecodeState('idle');
  };

  const handleDeleteReport = async () => {
    if (!user?.id || !activeExtraction) return;
    setIsDeleting(true);
    setDecodeError(null);
    try {
      const documentId = activeExtraction.documentId;
      await decoderService.deleteExtraction(user.id, activeExtraction.id);
      try {
        await deleteDocument(documentId);
      } catch {
        // Report removed; vault file may already be gone
      }
      track('vet_bill_report_deleted', { extractionId: activeExtraction.id });
      setActiveExtraction(null);
      setReviewResult(null);
      setDecodeState('idle');
      await loadHistory();
    } catch (err) {
      setDecodeError(getUserFacingError(err, 'decode', 'Failed to delete report.'));
    } finally {
      setIsDeleting(false);
    }
  };

  if (petsLoading || docsLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.loadingWrap}>
          <LoadingState message="Loading scan" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <header className={styles.header}>
            <h1 className={styles.title}>PetClues Scan</h1>
            <p className={styles.lead}>Add a pet first to scan documents.</p>
          </header>
        </div>
      </AppLayout>
    );
  }

  const displaySuccess =
    uploadState === 'success' && lastUploaded && decodeState !== 'report';
  const zoneStatus = uploadState === 'success' ? 'idle' : uploadState;
  const activeFileName =
    documents.find((d) => d.id === activeExtraction?.documentId)?.fileName ?? 'Document';
  const showReport = decodeState === 'report' && activeExtraction && reviewResult;
  const upgradeTier = decoderAccess.upgradeTierTarget;
  const showSwitcher = pets.length > 1;

  const dropzone = (
    <ScanMagicDropzone
      ref={uploadRef}
      status={zoneStatus}
      progress={uploadProgress}
      disabled={quotaExhausted || documentVaultFull}
      errorMessage={documentVaultFull ? DOCUMENT_VAULT_LIMIT_MESSAGE : uploadError}
      onFileSelect={(file) => void handleFileSelect(file)}
    />
  );

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <p className={styles.eyebrow}>{activePet.name}</p>
            {showSwitcher && (
              <div className={styles.switcher}>
                <PetSwitcher
                  pets={pets}
                  activeId={activePet.id}
                  onSelect={setActivePet}
                  variant="light"
                />
              </div>
            )}
          </div>
          <h1 className={styles.title}>PetClues Scan</h1>
          <p className={styles.lead}>
            Upload any vet bill, prescription, or health record. We extract the clarity.
          </p>
        </header>

        {decoderMockMode && (
          <p className={styles.mockBanner} role="status">
            Local preview - Vet Bill Decoder uses sample extraction data until Supabase is
            configured.
          </p>
        )}

        {showReport && (
          <div className={styles.reportBlock}>
            <VetBillDecoderReview
              record={activeExtraction}
              result={reviewResult}
              fileName={activeFileName}
              isSaving={isSaving}
              isDeleting={isDeleting}
              onChange={setReviewResult}
              onAddToTimeline={() => void handleAddToTimeline()}
              onClose={() => void handleCloseReport()}
              onDelete={() => void handleDeleteReport()}
            />
          </div>
        )}

        <div className={styles.stack}>
          <DecoderUsageBar
            decoderAccess={decoderAccess}
            isEnterprise={isEnterprise}
            isMonthlyQuota={isMonthlyDecoderQuota}
          />

          <div className={styles.dropzoneWrap}>
            {documentVaultFull ? (
              <PremiumGate
                requiredTier="Plus"
                title="Document Vault Limit Reached"
                description="Upgrade to Plus to unlock unlimited secure medical document storage."
                className={styles.gateMinHeight}
                onUpgrade={() => setDocumentUpgradeOpen(true)}
              >
                {dropzone}
              </PremiumGate>
            ) : quotaExhausted ? (
              <PremiumGate
                requiredTier={upgradeTier}
                title="Scan Limit Reached"
                description={`Upgrade to ${upgradeTier} to unlock more AI document extractions.`}
                className={styles.gateMinHeight}
              >
                {dropzone}
              </PremiumGate>
            ) : (
              dropzone
            )}
          </div>

          {decodeState === 'decoding' && (
            <LoadingState message="Creating your report (one-time AI scan)…" />
          )}
          {decodeError && !showReport && (
            <p className={styles.error} role="alert">
              {decodeError}
            </p>
          )}
          {displaySuccess && lastUploaded && (
            <UploadSuccessCard document={lastUploaded} decoding={decodeState === 'decoding'} />
          )}
        </div>

        <RecentScansHistory
          items={historyItems}
          timelineAccess={timelineAccess}
          activeId={activeExtraction?.id}
          onOpenRecord={openReport}
        />

        <div className={styles.formats}>
          <p className={styles.formatsEyebrow}>Supported formats</p>
          <ul className={styles.formatsList}>
            <li>Vet bills &amp; invoices</li>
            <li>Prescriptions</li>
            <li>Vaccine records</li>
            <li>Lab reports · PDF, JPG, PNG</li>
          </ul>
        </div>

        <div className={styles.trust}>
          <HealthDisclaimerNote compact />
        </div>

        <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
        <EditorialUpgradeModal
          isOpen={documentUpgradeOpen}
          onClose={() => setDocumentUpgradeOpen(false)}
          title="Document Vault Limit Reached"
          description="Upgrade to Plus to unlock unlimited secure medical document storage."
          requiredTier="Plus"
        />
      </div>
    </AppLayout>
  );
}

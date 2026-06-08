import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState } from '@/components/ui';
import { GettingStartedStrip } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import {
  ScanHero,
  UploadZone,
  UploadSuccessCard,
  SupportedDocuments,
  SavedReportsGrid,
  VetBillDecoderReview,
  type UploadZoneHandle,
} from '@/components/scan';
import { PremiumGate, PremiumUpgradePrompt, UpgradeModal } from '@/components/subscription';
import { useAuth } from '@/auth/AuthProvider';
import { useDocuments } from '@/documents';
import { useHealthRecords } from '@/healthRecords';
import { useReminders } from '@/reminders';
import { usePets } from '@/pets';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useAnalytics } from '@/analytics';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { formatFileTypeLabel } from '@/services/documents/documentService';
import { getHealthRecordService } from '@/services/healthRecords/healthRecordService';
import { getReminderService } from '@/services/reminders/reminderService';
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

const SCAN_GETTING_STARTED = [
  {
    step: '1',
    title: 'Upload a document',
    body: 'Drop a vet bill, prescription, or health report - PDF, JPG, or PNG all work.',
    image: PAGE_IMG.scan.docs,
    alt: 'Illustration of uploading pet documents',
  },
  {
    step: '2',
    title: 'Review the report',
    body: 'Our decoder extracts visits, medications, and follow-ups for you to confirm.',
    image: PAGE_IMG.scan.report,
    alt: 'Illustration of a decoded vet bill report',
  },
  {
    step: '3',
    title: 'Add to timeline',
    body: 'Approved items flow into health records, reminders, and your pet\'s life story.',
    image: PAGE_IMG.app.scan,
    alt: 'Illustration of the scan workflow',
  },
] as const;

type DecodeState = 'idle' | 'decoding' | 'report' | 'error';

function resultForRecord(record: VetBillExtractionRecord): VetBillExtractionResult {
  return record.approvedSnapshot ?? record.extractionResult;
}

export function ScanPage() {
  const { track } = useAnalytics();
  const { user } = useAuth();
  const { canAccess } = useSubscription();
  const uploadRef = useRef<UploadZoneHandle>(null);
  const decoderService = useMemo(() => getVetBillDecoderService(), []);
  const { activePet, isLoading: petsLoading, hasPets } = usePets();
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
  const uploadBlockRef = useRef<HTMLDivElement>(null);
  const docsSectionRef = useRef<HTMLDivElement>(null);
  const [reportsPanelHeight, setReportsPanelHeight] = useState<number | null>(null);

  const hasDecoder = canAccess('vetBillDecoder');
  const decoderMockMode = isVetBillDecoderMockMode();

  const loadHistory = useCallback(async () => {
    if (!user?.id || !activePet?.id || !hasDecoder) {
      setHistory([]);
      return;
    }
    const records = await decoderService.listExtractions(user.id, activePet.id);
    setHistory(records);
  }, [decoderService, user?.id, activePet?.id, hasDecoder]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useLayoutEffect(() => {
    const upload = uploadBlockRef.current;
    const docs = docsSectionRef.current;
    const mq = window.matchMedia('(min-width: 1280px)');

    const sync = () => {
      if (!mq.matches || !upload || !docs) {
        setReportsPanelHeight(null);
        return;
      }
      const leftCol = upload.parentElement;
      const gap = leftCol
        ? Number.parseFloat(getComputedStyle(leftCol).rowGap || getComputedStyle(leftCol).gap) ||
          40
        : 40;
      // Top aligns with upload (below hero); bottom aligns with end of document-types section
      setReportsPanelHeight(
        Math.round(upload.offsetHeight + gap + docs.offsetHeight),
      );
    };

    const ro = new ResizeObserver(sync);
    if (upload) ro.observe(upload);
    if (docs) ro.observe(docs);
    mq.addEventListener('change', sync);
    sync();

    return () => {
      ro.disconnect();
      mq.removeEventListener('change', sync);
    };
  }, [
    petsLoading,
    docsLoading,
    hasPets,
    activePet?.id,
    history.length,
    decodeState,
    uploadState,
    lastUploaded?.id,
    activeExtraction?.id,
  ]);

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
      if (!hasDecoder) {
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
        const message = err instanceof Error ? err.message : 'Decoder failed.';
        if (message.includes('Premium') || message.includes('premium_required')) {
          setUpgradeOpen(true);
        }
        setDecodeError(message);
      }
    },
    [user?.id, activePet?.id, hasDecoder, decoderService, openReport, track, loadHistory],
  );

  const handleUploadClick = () => {
    resetUploadState();
    setDecodeState('idle');
    setActiveExtraction(null);
    setReviewResult(null);
    uploadRef.current?.openFilePicker();
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!activePet) return;
      resetUploadState();
      setActiveExtraction(null);
      setReviewResult(null);

      try {
        const document = await uploadDocument(file);
        track('document_uploaded', {
          documentType: formatFileTypeLabel(document.fileType),
        });
        if (hasDecoder) {
          await runDecode(document.id, document.fileName);
        }
      } catch {
        // uploadDocument sets error state
      }
    },
    [activePet, uploadDocument, resetUploadState, track, runDecode, hasDecoder],
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
      setDecodeError(err instanceof Error ? err.message : 'Failed to add items to timeline.');
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

  const handleOpenHistoryRecord = (record: VetBillExtractionRecord) => {
    openReport(record);
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
      setDecodeError(err instanceof Error ? err.message : 'Failed to delete report.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (petsLoading || docsLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <ScanHero onUploadClick={() => {}} disabled />
          <div className={styles.body}>
            <LoadingState message="Loading scan" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !activePet) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <ScanHero onUploadClick={() => {}} petName="your pet" disabled />
          <div className={styles.body}>
            <p className={styles.emptyHint}>Add a pet first to scan documents.</p>
          </div>
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
  const showGettingStarted = history.length === 0 && !showReport;

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <ScanHero onUploadClick={handleUploadClick} petName={activePet.name} />

        {showGettingStarted && (
          <div className={styles.gettingStarted}>
            <GettingStartedStrip
              title="How scanning works"
              description="Upload once - PetClues organizes documents and builds your pet's care history."
              steps={SCAN_GETTING_STARTED}
            />
          </div>
        )}

        <div className={styles.body}>
          {decoderMockMode && (
            <p className={styles.mockBanner} role="status">
              Local preview - Vet Bill Decoder uses sample extraction data until Supabase is configured.
            </p>
          )}

          {!hasDecoder && (
            <PremiumUpgradePrompt
              feature="vetBillDecoder"
              compact
              onUpgrade={() => setUpgradeOpen(true)}
            />
          )}

          {showReport && (
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
          )}

          <div className={styles.scanLayout}>
            <div className={styles.leftCol}>
              <div ref={uploadBlockRef} className={styles.uploadBlock}>
                <UploadZone
                  ref={uploadRef}
                  status={zoneStatus}
                  progress={uploadProgress}
                  errorMessage={uploadError}
                  onFileSelect={(file) => void handleFileSelect(file)}
                />
                {decodeState === 'decoding' && (
                  <LoadingState message="Creating your report (one-time AI scan)…" />
                )}
                {decodeError && !showReport && (
                  <p className={styles.error} role="alert">
                    {decodeError}
                  </p>
                )}
                {displaySuccess && lastUploaded && (
                  <UploadSuccessCard
                    document={lastUploaded}
                    decoding={decodeState === 'decoding'}
                  />
                )}
              </div>
              <div ref={docsSectionRef} className={styles.docsSection}>
                <SupportedDocuments />
              </div>
            </div>

            <div
              className={styles.rightPanel}
              role="region"
              aria-label="Saved reports"
              style={
                reportsPanelHeight != null
                  ? {
                      height: reportsPanelHeight,
                      maxHeight: reportsPanelHeight,
                    }
                  : undefined
              }
            >
              {hasDecoder ? (
                <SavedReportsGrid
                  records={history}
                  activeId={activeExtraction?.id}
                  onOpenRecord={handleOpenHistoryRecord}
                  onUpload={handleUploadClick}
                />
              ) : (
                <PremiumGate feature="vetBillDecoder" compact>
                  <SavedReportsGrid records={[]} onUpload={handleUploadClick} />
                </PremiumGate>
              )}
            </div>
          </div>
        </div>

        <div className={styles.trustNote}>
          <HealthDisclaimerNote compact />
        </div>

        <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      </div>
    </AppLayout>
  );
}

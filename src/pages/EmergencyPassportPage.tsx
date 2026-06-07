import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, LoadingState } from '@/components/ui';
import { EmptyPetProfileState } from '@/components/empty-states';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { HealthRecordModal } from '@/components/pet-profile/HealthRecordModal';
import { useAnalytics } from '@/analytics';
import {
  PassportHighlightBand,
  PassportRecordSection,
  PassportEmergencyNotes,
  PassportExportSheet,
} from '@/components/emergency';
import { PASSPORT_IMG } from '@/data/passportImages';
import { downloadBlob, exportNodeToPng } from '@/utils/imageExport';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { buildPassportSummary } from '@/services/passport/passportService';
import type { CreateHealthRecordInput } from '@/services/healthRecords/healthRecordService';
import type { HealthRecord, HealthRecordType } from '@/services/healthRecords/healthRecordTypes';
import styles from './EmergencyPassportPage.module.css';

export function EmergencyPassportPage() {
  const { track } = useAnalytics();
  const { activePet, isLoading: petsLoading, hasPets } = usePets();
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
      setExportError(err instanceof Error ? err.message : 'Download failed. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [passport, track]);

  const openAdd = useCallback((type: HealthRecordType) => {
    setEditingRecord(null);
    setDefaultRecordType(type);
    setHealthModalOpen(true);
  }, []);

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
        <div className={styles.page}>
          <div className={styles.loadingWrap}>
            <LoadingState message="Loading passport" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !passport || !activePet) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.loadingWrap}>
            <EmptyPetProfileState />
          </div>
        </div>
      </AppLayout>
    );
  }

  const { identity } = passport;

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <PassportHighlightBand passport={passport} />

        <div className={styles.downloadBar}>
          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={() => void handleDownload()}
            disabled={exporting}
          >
            {exporting ? 'Preparing download…' : 'Download passport'}
          </Button>
          <p className={styles.downloadHint}>
            Saves a PNG with your pet&apos;s identity and full medical record.
          </p>
          {exportError && (
            <p className={styles.downloadError} role="alert">
              {exportError}
            </p>
          )}
        </div>

        <div className={styles.body}>
          <header className={styles.sectionIntro}>
            <h2 className={styles.sectionIntroTitle}>Medical record</h2>
            <p className={styles.sectionIntroText}>
              Structured health data for clinics and emergencies. Add or edit any section — counts
              and notes update live from your pet profile.
            </p>
          </header>

          <div className={styles.sectionsGrid}>
            <PassportRecordSection
              title="Vaccinations"
              records={passport.vaccinations}
              emptyMessage="No vaccinations recorded yet."
              image={PASSPORT_IMG.vaccinations}
              imageAlt="Vaccination record"
              onAdd={() => openAdd('vaccination')}
              onEdit={openEdit}
            />
            <PassportRecordSection
              title="Allergies"
              records={passport.allergies}
              emptyMessage="No allergies on file — add known reactions for safer care."
              variant="critical"
              image={PASSPORT_IMG.allergies}
              imageAlt="Allergy and ingredient label"
              onAdd={() => openAdd('allergy')}
              onEdit={openEdit}
            />
            <PassportRecordSection
              title="Medications"
              records={passport.medications}
              emptyMessage="No medications recorded."
              image={PASSPORT_IMG.medications}
              imageAlt="Prescription medication"
              onAdd={() => openAdd('medication')}
              onEdit={openEdit}
            />
            <PassportRecordSection
              title="Conditions"
              records={passport.conditions}
              emptyMessage="No diagnoses or surgeries recorded."
              image={PASSPORT_IMG.conditions}
              imageAlt="Medical record"
              onAdd={() => openAdd('diagnosis')}
              onEdit={openEdit}
            />
            <div className={styles.sectionFull}>
              <PassportEmergencyNotes
                notes={passport.emergencyNotes}
                onAddWellnessNote={() => openAdd('wellness')}
              />
            </div>
          </div>

          <footer className={styles.pageEnd}>
            <p className={styles.pageEndText}>
              <strong>PetClues Emergency Passport</strong> · {identity.petName} · Updated{' '}
              {identity.lastUpdated}
            </p>
            <HealthDisclaimerNote compact />
          </footer>
        </div>

        {passport && <PassportExportSheet ref={exportRef} passport={passport} />}

        <HealthRecordModal
          record={editingRecord}
          isOpen={healthModalOpen}
          onClose={() => setHealthModalOpen(false)}
          onSubmit={handleHealthSubmit}
          onDelete={deleteRecord}
          defaultRecordType={defaultRecordType}
        />
      </div>
    </AppLayout>
  );
}

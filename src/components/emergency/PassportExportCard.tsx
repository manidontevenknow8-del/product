import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { useAnalytics } from '@/analytics';
import { downloadBlob, exportNodeToPng } from '@/utils/imageExport';
import type { PassportData } from '@/services/passport/passportSummaryService';
import { PassportExportSheet } from './PassportExportSheet';
import styles from './PassportExportCard.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

type PassportExportCardProps = {
  passport: PassportData;
};

export function PassportExportCard({ passport }: PassportExportCardProps) {
  const { track } = useAnalytics();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    const node = sheetRef.current;
    if (!node) return;

    setExporting(true);
    setError(null);
    try {
      const blob = await exportNodeToPng(node, 2);
      const safeName = passport.identity.petName.replace(/[^\w.-]+/g, '_').slice(0, 40);
      await downloadBlob(blob, `${safeName}-emergency-passport.png`);
      track('passport_exported', { petName: passport.identity.petName });
    } catch (err) {
      setError(getUserFacingError(err, 'export', 'Export failed.'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <section className={styles.card} aria-labelledby="passport-export-title">
        <h2 id="passport-export-title" className={styles.title}>
          Export passport
        </h2>
        <p className={styles.description}>
          Download a PNG snapshot of {passport.identity.petName}&apos;s emergency passport -
          identity, health records, notes, and vault file list - for travel, boarding, or your
          vet.
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <Button
          variant="primary"
          size="md"
          type="button"
          onClick={() => void handleDownload()}
          disabled={exporting}
        >
          {exporting ? 'Preparing download…' : 'Download passport image'}
        </Button>
      </section>
      <PassportExportSheet ref={sheetRef} passport={passport} />
    </>
  );
}

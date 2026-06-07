import { useRef, useState } from 'react';
import { useAnalytics } from '@/analytics';
import { PASSPORT_IMG } from '@/data/passportImages';
import { downloadBlob, exportNodeToPng } from '@/utils/imageExport';
import type { PassportData } from '@/services/passport/passportSummaryService';
import { PassportExportSheet } from './PassportExportSheet';
import { PassportQRCode } from './PassportQRCode';
import styles from './PassportSharePanel.module.css';

type PassportSharePanelProps = {
  passport: PassportData;
};

export function PassportSharePanel({ passport }: PassportSharePanelProps) {
  const { track } = useAnalytics();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const link = passport.identity.secureLink;

  const handleExport = async () => {
    const node = sheetRef.current;
    if (!node) return;
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportNodeToPng(node, 2);
      const safeName = passport.identity.petName.replace(/[^\w.-]+/g, '_').slice(0, 40);
      await downloadBlob(blob, `${safeName}-emergency-passport.png`);
      track('passport_exported', { petName: passport.identity.petName });
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

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
    <>
      <section className={styles.panel} aria-labelledby="passport-share-title">
        <h2 id="passport-share-title" className={styles.title}>
          Share & export
        </h2>
        <p className={styles.subtitle}>
          Portable copies for travel, boarding, sitters, and emergency clinics.
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.actionCard} onClick={() => void handleExport()}>
            <div className={styles.actionMedia}>
              <img src={PASSPORT_IMG.highlight} alt="" className={styles.actionImg} aria-hidden />
            </div>
            <div className={styles.actionCopy}>
              <span className={styles.actionTitle}>Download image</span>
              <span className={styles.actionDesc}>
                PNG snapshot of identity, records, notes, and file list
              </span>
              {exporting && <span className={styles.actionStatus}>Preparing…</span>}
            </div>
          </button>

          <button type="button" className={styles.actionCard} onClick={() => void handleCopy()}>
            <div className={styles.actionMedia}>
              <img src={PASSPORT_IMG.medications} alt="" className={styles.actionImg} aria-hidden />
            </div>
            <div className={styles.actionCopy}>
              <span className={styles.actionTitle}>Copy secure link</span>
              <span className={styles.actionDesc}>Share this passport page URL</span>
              {copied && <span className={styles.actionStatus}>Copied</span>}
            </div>
          </button>

          <button
            type="button"
            className={styles.actionCard}
            onClick={() => setQrVisible((v) => !v)}
            aria-pressed={qrVisible}
          >
            <div className={styles.actionMedia}>
              <img src={PASSPORT_IMG.vaccinations} alt="" className={styles.actionImg} aria-hidden />
            </div>
            <div className={styles.actionCopy}>
              <span className={styles.actionTitle}>
                {qrVisible ? 'Hide QR code' : 'Show QR code'}
              </span>
              <span className={styles.actionDesc}>Quick scan for phones on-site</span>
            </div>
          </button>
        </div>

        {exportError && (
          <p className={styles.error} role="alert">
            {exportError}
          </p>
        )}

        {qrVisible && (
          <div className={styles.qrWrap}>
            <PassportQRCode petName={passport.identity.petName} />
          </div>
        )}

        <div className={styles.travelNote}>
          <img src={PASSPORT_IMG.emergencyNotes} alt="" className={styles.travelImg} aria-hidden />
          <p>
            Keep a downloaded copy with travel documents. Data updates when you edit records on
            PetClues.
          </p>
        </div>
      </section>
      <PassportExportSheet ref={sheetRef} passport={passport} />
    </>
  );
}

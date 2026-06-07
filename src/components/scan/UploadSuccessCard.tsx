import { SCAN_IMG } from '@/data/scanImages';
import type { PetDocumentRecord } from '@/services/documents/documentService';
import {
  formatDocumentUploadDate,
  formatFileTypeLabel,
} from '@/services/documents/documentService';
import styles from './UploadSuccessCard.module.css';

type UploadSuccessCardProps = {
  document: PetDocumentRecord;
  decoding?: boolean;
};

export function UploadSuccessCard({ document, decoding = false }: UploadSuccessCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={SCAN_IMG.docs} alt="" className={styles.mediaImg} aria-hidden />
        <div className={styles.mediaScrim} aria-hidden />
        <span className={styles.check} aria-hidden>
          ✓
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Upload complete</span>
          <h2 className={styles.title}>{document.fileName}</h2>
          <p className={styles.meta}>
            {formatFileTypeLabel(document.fileType)} ·{' '}
            {formatDocumentUploadDate(document.uploadedAt)}
          </p>
        </div>

        <p className={styles.summary}>
          {decoding
            ? 'Your file is in the vault. Building your AI report now…'
            : 'Stored securely in your pet vault. Open the report above or find it in saved reports.'}
        </p>

        <div className={styles.steps}>
          <span className={styles.step}>
            <span className={styles.stepDot} /> Vault saved
          </span>
          <span className={styles.step}>
            <span className={`${styles.stepDot} ${decoding ? styles.stepDotPulse : ''}`} />
            {decoding ? 'Report generating' : 'Report ready'}
          </span>
        </div>
      </div>
    </article>
  );
}

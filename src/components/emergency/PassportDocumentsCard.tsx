import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useDocuments } from '@/documents';
import { PASSPORT_IMG } from '@/data/passportImages';
import type { PetDocumentRecord } from '@/services/documents/documentTypes';
import {
  formatDocumentVaultDate,
  formatFileTypeLabel,
} from '@/services/documents/documentService';
import { EmptyDocumentsState } from '@/components/empty-states';
import { ROUTES } from '@/routes/paths';
import styles from './PassportDocumentsCard.module.css';

type PassportDocumentsCardProps = {
  documents: PetDocumentRecord[];
  compact?: boolean;
};

export function PassportDocumentsCard({ documents, compact = false }: PassportDocumentsCardProps) {
  const { isLoading, deleteDocument } = useDocuments();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (documentId: string) => {
    setDeletingId(documentId);
    try {
      await deleteDocument(documentId);
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section
      className={`${styles.card} ${compact ? styles.cardCompact : ''}`}
      aria-labelledby="passport-documents-title"
    >
      {!compact && (
        <div className={styles.media}>
          <img src={PASSPORT_IMG.highlight} alt="" className={styles.mediaImg} loading="lazy" aria-hidden />
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.head}>
          <div>
            <h2 id="passport-documents-title" className={styles.title}>
              Medical documents
            </h2>
            <p className={styles.subtitle}>
              Vault files synced with Profile and Scan. Remove here to delete everywhere.
            </p>
          </div>
          <Link to={ROUTES.SCAN}>
            <Button variant="secondary" size="sm">
              Scan
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <p className={styles.loading}>Loading…</p>
        ) : documents.length === 0 ? (
          <EmptyDocumentsState context="vault" compact />
        ) : (
          <ul className={styles.list}>
            {documents.map((doc) => (
              <li key={doc.id} className={styles.item}>
                <div className={styles.icon} aria-hidden />
                <div className={styles.info}>
                  <span className={styles.name}>{doc.fileName}</span>
                  <span className={styles.meta}>
                    {formatFileTypeLabel(doc.fileType)} ·{' '}
                    {formatDocumentVaultDate(doc.uploadedAt)}
                  </span>
                </div>
                {confirmId === doc.id ? (
                  <div className={styles.confirm}>
                    <p className={styles.confirmText}>Remove from vault?</p>
                    <div className={styles.confirmActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => setConfirmId(null)}
                        disabled={deletingId === doc.id}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => void handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? '…' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => setConfirmId(doc.id)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

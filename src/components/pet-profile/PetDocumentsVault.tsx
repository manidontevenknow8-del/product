import { useRef, useState, type ChangeEvent } from 'react';
import { DOCUMENT_VAULT_LIMIT_MESSAGE, useDocuments } from '@/documents';
import { EditorialUpgradeModal } from '@/components/ui';
import { EmptyDocumentsState } from '@/components/empty-states';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import {
  formatDocumentVaultDate,
  formatFileTypeLabel,
} from '@/services/documents/documentService';
import styles from './PetDocumentsVault.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

export function PetDocumentsVault() {
  const fileRef = useRef<HTMLInputElement>(null);
  const documentAccess = useFeatureAccess('documents');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const {
    documents,
    isLoading,
    uploadState,
    uploadProgress,
    uploadError,
    uploadDocument,
    resetUploadState,
  } = useDocuments();
  const [localError, setLocalError] = useState<string | null>(null);

  const isUploading = uploadState === 'uploading';
  const displayError = localError ?? (uploadState === 'error' ? uploadError : null);

  const showDocumentLimitReached = () => {
    setLocalError(DOCUMENT_VAULT_LIMIT_MESSAGE);
    setUpgradeOpen(true);
  };

  const handleChooseFile = () => {
    if (!documentAccess.isAllowed) {
      showDocumentLimitReached();
      return;
    }
    fileRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setLocalError(null);
    resetUploadState();

    if (!documentAccess.isAllowed) {
      showDocumentLimitReached();
      return;
    }

    try {
      await uploadDocument(file);
    } catch (err) {
      const message = getUserFacingError(err, 'upload', 'Upload failed.');
      setLocalError(message);
      if (message === DOCUMENT_VAULT_LIMIT_MESSAGE) {
        setUpgradeOpen(true);
      }
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Documents vault</h2>
          <p className={styles.subtitle}>Secure storage for all pet records</p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.secureNote}>
            <span className={styles.secureDot} aria-hidden="true" />
            Encrypted & private
          </span>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.loadingHint}>Loading documents…</p>
      ) : documents.length === 0 ? (
        <EmptyDocumentsState context="vault" compact />
      ) : (
        <div className={styles.grid}>
          {documents.map((doc) => (
            <article key={doc.id} className={styles.doc}>
              <div className={styles.docIcon}>
                <div className={styles.docIconInner} />
              </div>
              <div className={styles.docName}>{doc.fileName}</div>
              <div className={styles.docMeta}>
                {formatDocumentVaultDate(doc.uploadedAt)} · {formatFileTypeLabel(doc.fileType)}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className={styles.uploadArea}>
        <p className={styles.uploadLabel}>Upload a document</p>
        <p className={styles.uploadHint}>PDF, JPG, or PNG - up to 10 MB</p>

        {isUploading && (
          <div className={styles.uploadProgress}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.max(uploadProgress, 8)}%` }}
              />
            </div>
            <span className={styles.progressLabel}>Uploading… {uploadProgress}%</span>
          </div>
        )}

        {uploadState === 'success' && (
          <p className={styles.uploadSuccess} role="status">
            Document saved to vault.
          </p>
        )}

        {displayError && (
          <p className={styles.uploadError} role="alert">
            {displayError}
          </p>
        )}

        <button
          type="button"
          className={styles.uploadBtn}
          onClick={handleChooseFile}
          disabled={isUploading}
        >
          {displayError ? 'Try again' : 'Choose file'}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
          className={styles.fileInput}
          onChange={(e) => void handleFileChange(e)}
          aria-label="Upload vault document"
        />
      </div>

      <EditorialUpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        title="Document Vault Limit Reached"
        description="Upgrade to Plus to unlock unlimited secure medical document storage."
        requiredTier="Plus"
      />
    </section>
  );
}

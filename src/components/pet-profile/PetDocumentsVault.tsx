import { useRef, useState, type ChangeEvent } from 'react';
import { DOCUMENT_VAULT_LIMIT_MESSAGE, useDocuments } from '@/documents';
import { EditorialUpgradeModal } from '@/components/ui';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import {
  formatDocumentVaultDate,
  formatFileTypeLabel,
} from '@/services/documents/documentService';
import styles from './PetDocumentsVault.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

function DocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 3h8l4 4v14H8V3Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M16 3v4h4M10 12h6M10 16h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4v10M8 10l4 4 4-4M5 20h14"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className={styles.uploadIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20V8M8 12l4-4 4 4M5 4h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PetDocumentsVault({ showHeader = true }: { showHeader?: boolean }) {
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

  const openFilePicker = () => {
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
      {showHeader && (
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>Documents vault</h2>
            <div className={styles.seal}>
              <svg className={styles.sealIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="5" y="11" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Encrypted &amp; private
            </div>
          </div>
          <p className={styles.subtitle}>Secure storage for all pet records</p>
        </div>
      )}

      {isLoading ? (
        <p className={styles.loadingHint}>Loading documents…</p>
      ) : documents.length === 0 ? (
        <div className={styles.panel}>
          <p className={styles.emptyHint}>No documents on file yet — upload your first record below.</p>
        </div>
      ) : (
        <div className={styles.shelf}>
          <div className={styles.shelfLedge} aria-hidden />
          <div className={styles.shelfGrid}>
            {documents.map((doc, index) => (
              <article key={doc.id} className={styles.volume}>
                <div className={styles.volumeSpine} aria-hidden>
                  <span className={styles.volumeIndex}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className={styles.volumeFace}>
                  <div className={styles.docIconWrap}>
                    <DocIcon />
                  </div>
                  <div className={styles.docInfo}>
                    <div className={styles.docName}>{doc.fileName}</div>
                    <div className={styles.docMeta}>
                      {formatDocumentVaultDate(doc.uploadedAt)} · {formatFileTypeLabel(doc.fileType)}
                    </div>
                  </div>
                  <button type="button" className={styles.downloadBtn} aria-label={`Download ${doc.fileName}`}>
                    <DownloadIcon />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div
        className={styles.uploadArea}
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openFilePicker();
          }
        }}
      >
        <UploadIcon />
        <p className={styles.uploadLabel}>
          Drop files here or{' '}
          <button type="button" className={styles.uploadBrowse} onClick={(e) => {
            e.stopPropagation();
            openFilePicker();
          }}>
            browse
          </button>
        </p>
        <p className={styles.uploadHint}>PDF · JPG · PNG · up to 10 MB</p>

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

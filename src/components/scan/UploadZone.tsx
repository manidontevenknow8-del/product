import {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import { ScanEmptyState } from './ScanEmptyState';
import styles from './UploadZone.module.css';

export type UploadZoneHandle = {
  openFilePicker: () => void;
};

export type UploadZoneStatus = 'idle' | 'uploading' | 'success' | 'error';

type UploadZoneProps = {
  status: UploadZoneStatus;
  progress: number;
  errorMessage?: string | null;
  onFileSelect: (file: File) => void;
};

export const UploadZone = forwardRef<UploadZoneHandle, UploadZoneProps>(
  function UploadZone({ status, progress, errorMessage, onFileSelect }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const isProcessing = status === 'uploading';

    useImperativeHandle(ref, () => ({
      openFilePicker: () => inputRef.current?.click(),
    }));

    const handleFile = (file: File | undefined) => {
      if (!file || isProcessing) return;
      onFileSelect(file);
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (!isProcessing) setIsDragging(true);
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0]);
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0]);
      e.target.value = '';
    };

    return (
      <section
        className={`${styles.zone} ${
          isDragging ? styles.zoneDragging : ''
        } ${isProcessing ? styles.zoneProcessing : ''} ${
          status === 'error' ? styles.zoneError : ''
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={styles.glow} aria-hidden="true" />

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
          className={styles.input}
          onChange={onInputChange}
          aria-label="Upload document"
        />

        <div className={styles.body}>
          {status === 'error' && errorMessage ? (
            <div className={styles.errorState}>
              <p className={styles.errorTitle}>Upload failed</p>
              <p className={styles.errorMessage}>{errorMessage}</p>
            </div>
          ) : isProcessing ? (
            <div className={styles.processing}>
              <div className={styles.progressTrack} aria-hidden="true">
                <div
                  className={styles.progressFill}
                  style={{ width: `${Math.max(progress, 8)}%` }}
                />
              </div>
              <p className={styles.processingTitle}>Uploading your document…</p>
              <p className={styles.processingHint}>
                {progress > 0 ? `${progress}% complete` : 'Preparing upload'}
              </p>
            </div>
          ) : (
            <ScanEmptyState />
          )}
        </div>

        {!isProcessing && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => inputRef.current?.click()}
            >
              {status === 'error' ? 'Try again' : 'Choose file'}
            </button>
          </div>
        )}
      </section>
    );
  },
);

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import type { UploadZoneStatus } from './UploadZone';
import styles from './ScanMagicDropzone.module.css';

export type ScanMagicDropzoneHandle = {
  openFilePicker: () => void;
};

type ScanMagicDropzoneProps = {
  status: UploadZoneStatus;
  progress: number;
  errorMessage?: string | null;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
};

export const ScanMagicDropzone = forwardRef<ScanMagicDropzoneHandle, ScanMagicDropzoneProps>(
  function ScanMagicDropzone(
    { status, progress, errorMessage, disabled = false, onFileSelect },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const isProcessing = status === 'uploading';
    const isDisabled = disabled || isProcessing;

    useImperativeHandle(ref, () => ({
      openFilePicker: () => {
        if (!isDisabled) inputRef.current?.click();
      },
    }));

    const handleFile = (file: File | undefined) => {
      if (!file || isDisabled) return;
      onFileSelect(file);
    };

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (!isDisabled) setIsDragging(true);
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

    const zoneClass = [
      styles.zone,
      isDisabled ? styles.zoneDisabled : '',
      isDragging ? styles.zoneDragging : '',
      status === 'error' ? styles.zoneError : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <section
        className={zoneClass}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-disabled={isDisabled || undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
          className={styles.fileInput}
          onChange={onInputChange}
          disabled={isDisabled}
          aria-label="Upload document"
        />

        {status === 'error' && errorMessage ? (
          <div className={styles.stack}>
            <p className={styles.errorTitle}>Upload failed</p>
            <p className={styles.errorText}>{errorMessage}</p>
            {!isDisabled && (
              <button type="button" className={styles.retryBtn} onClick={() => inputRef.current?.click()}>
                Try again
              </button>
            )}
          </div>
        ) : isProcessing ? (
          <div className={styles.stack}>
            <div className={styles.progressTrack} aria-hidden>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
            <p className={styles.uploadTitle}>Uploading…</p>
            <p className={styles.uploadMeta}>
              {progress > 0 ? `${progress}% complete` : 'Preparing your document'}
            </p>
          </div>
        ) : (
          <div className={`${styles.stack} ${styles.stackLg}`}>
            <p className={styles.eyebrow}>Drop files here</p>
            <p className={styles.hint}>
              PDF, JPG, or PNG · vet bills, prescriptions, vaccine cards
            </p>
            {!isDisabled && (
              <button
                type="button"
                className={styles.chooseBtn}
                onClick={() => inputRef.current?.click()}
              >
                Choose file
              </button>
            )}
          </div>
        )}
      </section>
    );
  },
);

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import type { UploadZoneStatus } from './UploadZone';

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

    return (
      <section
        className={`relative flex min-h-[18rem] flex-col items-center justify-center rounded-none border border-dashed px-6 py-14 text-center transition-colors sm:min-h-[22rem] sm:px-10 ${
          isDisabled
            ? 'pointer-events-none border-stone-200 bg-stone-50/30 opacity-50'
            : isDragging
              ? 'border-stone-500 bg-stone-100/60'
              : status === 'error'
                ? 'border-red-200/80 bg-red-50/30'
                : 'border-stone-300 bg-stone-50/50 hover:border-stone-400 hover:bg-stone-50/80'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-disabled={isDisabled || undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
          className="sr-only"
          onChange={onInputChange}
          disabled={isDisabled}
          aria-label="Upload document"
        />

        {status === 'error' && errorMessage ? (
          <div className="max-w-md space-y-2">
            <p className="font-serif text-2xl text-stone-900">Upload failed</p>
            <p className="font-sans text-sm text-stone-500">{errorMessage}</p>
            {!isDisabled && (
              <button
                type="button"
                className="mt-4 font-sans text-xs uppercase tracking-[0.18em] text-stone-700 underline-offset-4 hover:underline"
                onClick={() => inputRef.current?.click()}
              >
                Try again
              </button>
            )}
          </div>
        ) : isProcessing ? (
          <div className="max-w-sm space-y-4">
            <div
              className="mx-auto h-px w-32 overflow-hidden bg-stone-200"
              aria-hidden
            >
              <div
                className="h-full bg-stone-800 transition-all duration-300"
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
            <p className="font-serif text-2xl text-stone-900">Uploading…</p>
            <p className="font-sans text-sm text-stone-500">
              {progress > 0 ? `${progress}% complete` : 'Preparing your document'}
            </p>
          </div>
        ) : (
          <div className="max-w-lg space-y-4">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-stone-400">
              Drop files here
            </p>
            <p className="font-sans text-sm leading-relaxed text-stone-500">
              PDF, JPG, or PNG · vet bills, prescriptions, vaccine cards
            </p>
            {!isDisabled && (
              <button
                type="button"
                className="mt-2 inline-flex items-center justify-center border border-stone-800 bg-stone-900 px-6 py-2.5 font-sans text-xs uppercase tracking-[0.2em] text-stone-50 transition-colors hover:bg-stone-800"
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

import { useEffect, useMemo, useRef, useState } from 'react';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import {
  buildHealthDossierData,
  type DossierOwnerContact,
} from '@/services/healthDossier/buildHealthDossierData';
import { downloadHealthDossierPdf } from '@/services/healthDossier/downloadHealthDossierPdf';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './DossierExportModal.module.css';

type DossierExportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pet: PetRecord;
  records: HealthRecord[];
  owner: DossierOwnerContact;
  /** When true, compile + download as soon as the modal opens. */
  autoDownload?: boolean;
};

type CompileState = 'idle' | 'compiling' | 'done' | 'error';

/**
 * Apple/Amex-style modal that compiles a pet's Official Digital Health Dossier PDF.
 */
export function DossierExportModal({
  isOpen,
  onClose,
  pet,
  records,
  owner,
  autoDownload = true,
}: DossierExportModalProps) {
  const [state, setState] = useState<CompileState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const dossier = useMemo(
    () => buildHealthDossierData(pet, records, owner),
    [pet, records, owner],
  );

  useEffect(() => {
    if (!isOpen) {
      startedRef.current = false;
      setState('idle');
      setFileName(null);
      setError(null);
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !autoDownload || startedRef.current) return;
    startedRef.current = true;
    void compile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- compile on open once
  }, [isOpen, autoDownload]);

  async function compile() {
    setState('compiling');
    setError(null);
    setFileName(null);
    try {
      // Soften photo failures (CORS) by stripping remote photo if render fails once.
      let payload = dossier;
      try {
        const name = await downloadHealthDossierPdf(payload);
        setFileName(name);
        setState('done');
        return;
      } catch (firstError) {
        if (payload.photoUrl) {
          payload = { ...payload, photoUrl: null };
          const name = await downloadHealthDossierPdf(payload);
          setFileName(name);
          setState('done');
          return;
        }
        throw firstError;
      }
    } catch (err) {
      setState('error');
      setError(
        getUserFacingError(err, 'export', 'Could not compile the Official Health Dossier.'),
      );
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-export-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        <p className={styles.eyebrow}>Centurion archive</p>
        <h2 id="dossier-export-title" className={styles.title}>
          Official Health Dossier
        </h2>
        <p className={styles.body}>
          Compiling {pet.name}&apos;s identification, vaccination matrix, and clinical timeline into
          a pristine three-page PDF.
        </p>

        {state === 'compiling' && (
          <p className={styles.status} role="status">
            Compiling Centurion Archive…
          </p>
        )}

        {state === 'done' && (
          <div className={styles.success} role="status">
            <p className={styles.statusDone}>Dossier ready</p>
            <p className={styles.fileName}>{fileName}</p>
            <p className={styles.hint}>Your browser should have started the download automatically.</p>
          </div>
        )}

        {state === 'error' && error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {(state === 'idle' || state === 'error' || state === 'done') && (
            <button type="button" className={styles.primary} onClick={() => void compile()}>
              {state === 'done' ? 'Download again' : 'Export Official Health Dossier (PDF)'}
            </button>
          )}
          <button type="button" className={styles.secondary} onClick={onClose}>
            {state === 'done' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

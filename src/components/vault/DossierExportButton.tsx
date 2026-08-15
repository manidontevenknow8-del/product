import { useMemo, useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { DossierExportModal } from '@/components/vault/DossierExportModal';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import styles from './DossierExportButton.module.css';

type DossierExportButtonProps = {
  pet: PetRecord;
  records: HealthRecord[];
  /** Visual variant for editorial heroes vs vault chapter. */
  variant?: 'hero' | 'vault';
};

/**
 * Primary CTA that opens the Official Health Dossier compiler modal.
 */
export function DossierExportButton({
  pet,
  records,
  variant = 'vault',
}: DossierExportButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const owner = useMemo(
    () => ({
      name: user?.name ?? 'Pet guardian',
      email: user?.email ?? '',
      phone: null as string | null,
    }),
    [user?.name, user?.email],
  );

  return (
    <>
      <button
        type="button"
        className={variant === 'hero' ? styles.heroBtn : styles.vaultBtn}
        onClick={() => setOpen(true)}
      >
        Export Official Health Dossier (PDF)
      </button>
      <DossierExportModal
        isOpen={open}
        onClose={() => setOpen(false)}
        pet={pet}
        records={records}
        owner={owner}
        autoDownload
      />
    </>
  );
}

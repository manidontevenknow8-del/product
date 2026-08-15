import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { QRTagModal } from '@/components/tools/QRTagModal';
import { PublicEmergencyQrCode } from '@/components/emergency/PublicEmergencyQrCode';
import { useEmergencyPassport } from '@/hooks/useEmergencyPassport';
import { useHealthRecords } from '@/healthRecords';
import { usePets } from '@/pets';
import { useFeatureAccess } from '@/subscription';
import { ROUTES } from '@/routes/paths';
import { buildPublicTriageUrl } from '@/services/emergencyPassport/emergencyPassportTypes';
import styles from './QRGeneratorPage.module.css';

/**
 * Authenticated QR Tag Generator - printable collar, crate, and wallet emergency tags.
 */
export function QRGeneratorPage() {
  const { activePet, pets, setActivePet } = usePets();
  const { records } = useHealthRecords();
  const emergencyShareAccess = useFeatureAccess('emergencyCareMode');
  const {
    passport,
    isLoading,
    canEdit,
    ensureLink,
    regenerateToken,
  } = useEmergencyPassport(activePet, records);

  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPremiumAccess = emergencyShareAccess.isAllowed;
  const publicId = passport && !passport.revokedAt ? passport.publicToken : null;
  const triageUrl = useMemo(
    () => (publicId ? buildPublicTriageUrl(publicId) : null),
    [publicId],
  );

  const handleEnsure = async () => {
    setBusy(true);
    setError(null);
    try {
      await ensureLink();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create emergency link.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className={styles.page}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Tools</p>
          <h1 className={styles.title}>QR Tag Generator</h1>
          <p className={styles.lead}>
            Print high-contrast QR tags for collars, travel crates, and wallet cards. Each scan opens
            a read-only emergency triage profile for finders and ER staff.
          </p>
        </header>

        {pets.length > 1 && (
          <div className={styles.petPicker} role="group" aria-label="Select pet">
            {pets.map((pet) => (
              <button
                key={pet.id}
                type="button"
                className={`${styles.petChip} ${pet.id === activePet?.id ? styles.petChipActive : ''}`}
                onClick={() => setActivePet(pet.id)}
              >
                {pet.name}
              </button>
            ))}
          </div>
        )}

        {!activePet ? (
          <p className={styles.empty}>
            Add a pet first, then generate emergency QR tags.{' '}
            <Link to={ROUTES.ONBOARDING}>Start onboarding</Link>
          </p>
        ) : !hasPremiumAccess ? (
          <div className={styles.gate}>
            <h2 className={styles.gateTitle}>Plus feature</h2>
            <p className={styles.gateBody}>
              QR emergency tags require PetClues Plus so your public triage link stays available for
              sitters, boarding, and ER handoff.
            </p>
            <Link to={ROUTES.PRICING} className={styles.primaryBtn}>
              View plans
            </Link>
          </div>
        ) : (
          <section className={styles.panel}>
            <div className={styles.copyCol}>
              <h2 className={styles.panelTitle}>{activePet.name}&apos;s emergency tag</h2>
              <p className={styles.panelLead}>
                Tags resolve to{' '}
                <code className={styles.code}>/p/&#123;publicId&#125;</code> - triage data only
                (owner phones, severe allergies, rabies tag, veterinarian). Vault documents and
                billing stay private.
              </p>

              {isLoading ? (
                <p className={styles.status}>Preparing public link…</p>
              ) : triageUrl && publicId ? (
                <>
                  <p className={styles.url}>{triageUrl}</p>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.primaryBtn}
                      onClick={() => setModalOpen(true)}
                    >
                      Open QR Tag Generator
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        disabled={busy}
                        onClick={() => void regenerateToken()}
                      >
                        Rotate public ID
                      </button>
                    )}
                    <Link to={ROUTES.EMERGENCY_PASSPORT} className={styles.secondaryBtn}>
                      Edit triage fields
                    </Link>
                  </div>
                </>
              ) : (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    disabled={busy || !canEdit}
                    onClick={() => void handleEnsure()}
                  >
                    {busy ? 'Creating link…' : 'Create emergency triage link'}
                  </button>
                  <Link to={ROUTES.EMERGENCY_PASSPORT} className={styles.secondaryBtn}>
                    Open emergency passport
                  </Link>
                </div>
              )}

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
            </div>

            {triageUrl && (
              <div className={styles.qrCol}>
                <PublicEmergencyQrCode
                  url={triageUrl}
                  label={`${activePet.name} emergency triage QR`}
                />
              </div>
            )}
          </section>
        )}

        {activePet && publicId && (
          <QRTagModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            pet={activePet}
            publicId={publicId}
          />
        )}
      </div>
    </AppLayout>
  );
}

export default QRGeneratorPage;

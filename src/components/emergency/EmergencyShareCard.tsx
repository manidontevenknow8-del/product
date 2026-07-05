import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PremiumGate } from '@/components/ui';
import { PublicEmergencyQrCode } from '@/components/emergency/PublicEmergencyQrCode';
import { ROUTES } from '@/routes/paths';
import { buildPublicEmergencyUrl } from '@/services/emergencyPassport/emergencyPassportTypes';
import type { EmergencyPassportRecord } from '@/services/emergencyPassport/emergencyPassportTypes';
import styles from './EmergencyShareCard.module.css';

type EmergencyShareCardProps = {
  petName: string;
  passport: EmergencyPassportRecord | null;
  isLoading: boolean;
  hasPremiumAccess: boolean;
  canEdit: boolean;
  onEnsureLink: () => Promise<unknown>;
  onRegenerateToken: () => Promise<unknown>;
};

export function EmergencyShareCard({
  petName,
  passport,
  isLoading,
  hasPremiumAccess,
  canEdit,
  onEnsureLink,
  onRegenerateToken,
}: EmergencyShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicUrl = useMemo(
    () => (passport && !passport.revokedAt ? buildPublicEmergencyUrl(passport.publicToken) : null),
    [passport],
  );

  const handleCopy = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleEnsure = async () => {
    setBusy(true);
    setError(null);
    try {
      await onEnsureLink();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create share link.');
    } finally {
      setBusy(false);
    }
  };

  const handleRegenerate = async () => {
    if (!canEdit) return;
    setBusy(true);
    setError(null);
    try {
      await onRegenerateToken();
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not regenerate link.');
    } finally {
      setBusy(false);
    }
  };

  const title = `Share ${petName}'s Emergency Info`;

  if (!hasPremiumAccess) {
    return (
      <section className={styles.section} aria-labelledby="emergency-share-title">
        <PremiumGate
          requiredTier="Plus"
          title="Share emergency info"
          description="Upgrade to Plus to publish a token-gated emergency link for sitters, boarding, and ER vets."
        >
          <div className={styles.gatedPreview}>
            <p className={styles.gatedTitle}>{title}</p>
            <p className={styles.gatedCopy}>
              Allergies, medications, vet contact, insurance, and microchip — on a plain page anyone
              can open from a link or QR code.
            </p>
          </div>
        </PremiumGate>
      </section>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="emergency-share-title">
      <div className={styles.card}>
        <div className={styles.copyCol}>
          <p className={styles.kicker}>Emergency handoff</p>
          <h2 id="emergency-share-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.lead}>
            Give sitters, boarding, or an ER vet a plain page with allergies, meds, vet contact,
            insurance, and microchip — no PetClues login required.
          </p>

          {isLoading ? (
            <p className={styles.status}>Preparing share link…</p>
          ) : publicUrl ? (
            <>
              <p className={styles.url} title={publicUrl}>
                {publicUrl}
              </p>
              <div className={styles.actions}>
                <button type="button" className={styles.primaryBtn} onClick={() => void handleCopy()}>
                  {copied ? 'Link copied' : 'Copy public link'}
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    disabled={busy}
                    onClick={() => void handleRegenerate()}
                  >
                    {busy ? 'Working…' : 'Regenerate link'}
                  </button>
                )}
                <Link to={ROUTES.EMERGENCY_PASSPORT} className={styles.ghostLink}>
                  Full passport
                </Link>
              </div>
            </>
          ) : (
            <div className={styles.actions}>
              {canEdit ? (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={busy}
                  onClick={() => void handleEnsure()}
                >
                  {busy ? 'Creating…' : 'Create share link'}
                </button>
              ) : (
                <p className={styles.status}>
                  No active link yet. Ask a household editor to publish emergency info.
                </p>
              )}
              <Link to={ROUTES.PET_PROFILE} className={styles.ghostLink}>
                Edit in Records
              </Link>
            </div>
          )}

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>

        {publicUrl && (
          <div className={styles.qrCol}>
            <PublicEmergencyQrCode
              url={publicUrl}
              label={`QR code for ${petName} emergency information`}
            />
            <p className={styles.qrCaption}>Scan to open emergency sheet</p>
          </div>
        )}
      </div>
    </section>
  );
}

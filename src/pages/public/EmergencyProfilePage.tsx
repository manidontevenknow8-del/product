import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEmergencyPassportService } from '@/services/emergencyPassport/emergencyPassportService';
import type { PublicEmergencyTriage } from '@/services/emergencyPassport/emergencyPassportTypes';
import { ROUTES } from '@/routes/paths';
import styles from './EmergencyProfilePage.module.css';

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function CallButton({ phone, label }: { phone: string; label: string }) {
  return (
    <a className={styles.callBtn} href={telHref(phone)}>
      <span className={styles.callLabel}>{label}</span>
      <span className={styles.callNumber}>{phone}</span>
      <span className={styles.callHint}>Tap to call</span>
    </a>
  );
}

/**
 * Public, auth-free emergency triage profile for QR collar / crate / wallet tags.
 * Loads only the whitelisted triage payload - never vault docs, billing, or private notes.
 */
export function EmergencyProfilePage() {
  const { publicId = '' } = useParams<{ publicId: string }>();
  const [data, setData] = useState<PublicEmergencyTriage | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (!publicId || publicId.length < 8) {
      setState('missing');
      return;
    }

    let cancelled = false;
    setState('loading');

    void getEmergencyPassportService()
      .getTriageByPublicId(publicId)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setData(null);
          setState('missing');
          return;
        }
        setData(result);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setState('missing');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicId]);

  if (state === 'loading') {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Loading emergency triage…</p>
      </main>
    );
  }

  if (state === 'missing' || !data) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>PetClues Emergency</p>
          <h1 className={styles.title}>Profile unavailable</h1>
          <p className={styles.lead}>
            This emergency tag link is invalid or has been revoked. Ask the pet guardian for a new
            QR tag.
          </p>
        </div>
      </main>
    );
  }

  const speciesLabel =
    data.species === 'dog' ? 'Dog' : data.species === 'cat' ? 'Cat' : data.species;

  return (
    <main className={styles.page}>
      <article className={styles.card}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Emergency triage</p>
            <h1 className={styles.title}>{data.petName}</h1>
            <p className={styles.meta}>
              {[speciesLabel, data.breed].filter(Boolean).join(' · ') || 'Companion animal'}
            </p>
          </div>
          {data.photoUrl ? (
            <img src={data.photoUrl} alt="" className={styles.photo} />
          ) : (
            <div className={styles.photoFallback} aria-hidden>
              {data.petName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </header>

        <section className={styles.callSection} aria-label="Emergency owner contacts">
          <h2 className={styles.sectionTitle}>Call owner now</h2>
          {data.ownerPhonePrimary || data.ownerPhoneSecondary ? (
            <div className={styles.callStack}>
              {data.ownerPhonePrimary && (
                <CallButton phone={data.ownerPhonePrimary} label="Primary contact" />
              )}
              {data.ownerPhoneSecondary && (
                <CallButton phone={data.ownerPhoneSecondary} label="Secondary contact" />
              )}
            </div>
          ) : (
            <p className={styles.empty}>No owner phone numbers listed on this tag.</p>
          )}
        </section>

        <section className={`${styles.block} ${styles.blockCritical}`}>
          <h2 className={styles.blockTitle}>Severe allergies</h2>
          {data.severeAllergies.length === 0 ? (
            <p className={styles.empty}>No severe allergies listed.</p>
          ) : (
            <ul className={styles.list}>
              {data.severeAllergies.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Rabies tag number</h2>
          {data.rabiesTagNumber ? (
            <p className={styles.mono}>{data.rabiesTagNumber}</p>
          ) : (
            <p className={styles.empty}>No rabies tag number listed.</p>
          )}
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Primary veterinarian</h2>
          {data.vetName || data.vetPhone ? (
            <div className={styles.vetBlock}>
              {data.vetName && <p className={styles.vetName}>{data.vetName}</p>}
              {data.vetPhone && (
                <a className={styles.phoneLink} href={telHref(data.vetPhone)}>
                  {data.vetPhone}
                </a>
              )}
            </div>
          ) : (
            <p className={styles.empty}>No veterinarian contact listed.</p>
          )}
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerCta}>
            Create a permanent digital passport and emergency vault for your pet at{' '}
            <Link to={ROUTES.LANDING} className={styles.footerLink}>
              PetClues.com
            </Link>
          </p>
        </footer>
      </article>
    </main>
  );
}

export default EmergencyProfilePage;

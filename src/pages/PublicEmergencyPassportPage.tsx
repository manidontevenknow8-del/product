import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEmergencyPassportService } from '@/services/emergencyPassport/emergencyPassportService';
import type { PublicEmergencyPassport } from '@/services/emergencyPassport/emergencyPassportTypes';
import styles from './PublicEmergencyPassportPage.module.css';

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function FieldBlock({
  title,
  lines,
  empty,
  critical = false,
}: {
  title: string;
  lines: string[];
  empty: string;
  critical?: boolean;
}) {
  return (
    <section className={`${styles.block} ${critical ? styles.blockCritical : ''}`}>
      <h2 className={styles.blockTitle}>{title}</h2>
      {lines.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        <ul className={styles.list}>
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function PublicEmergencyPassportPage() {
  const { token = '' } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicEmergencyPassport | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    if (!token) {
      setState('missing');
      return;
    }

    let cancelled = false;
    setState('loading');

    void getEmergencyPassportService()
      .getPublicByToken(token)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState('missing');
          setData(null);
          return;
        }
        setData(result);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('missing');
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (state === 'loading') {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Loading emergency information…</p>
      </main>
    );
  }

  if (state === 'missing' || !data) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>PetClues Emergency</p>
          <h1 className={styles.title}>Link unavailable</h1>
          <p className={styles.lead}>
            This emergency link is invalid or has been revoked. Ask the pet owner for a new link.
          </p>
        </div>
      </main>
    );
  }

  const { criticalFields } = data;
  const speciesLabel =
    data.species === 'dog' ? 'Dog' : data.species === 'cat' ? 'Cat' : data.species;

  return (
    <main className={styles.page}>
      <article className={styles.card}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Emergency pet information</p>
            <h1 className={styles.title}>{data.petName}</h1>
            <p className={styles.meta}>
              {[speciesLabel, data.breed].filter(Boolean).join(' · ')}
            </p>
          </div>
          {data.photoUrl && (
            <img src={data.photoUrl} alt="" className={styles.photo} />
          )}
        </header>

        <FieldBlock
          title="Allergies"
          lines={criticalFields.allergies}
          empty="No allergies listed."
          critical
        />

        <FieldBlock
          title="Current medications"
          lines={criticalFields.medications}
          empty="No medications listed."
          critical
        />

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Veterinary contact</h2>
          {criticalFields.vetName || criticalFields.vetPhone ? (
            <div className={styles.contact}>
              {criticalFields.vetName && (
                <p className={styles.contactPrimary}>{criticalFields.vetName}</p>
              )}
              {criticalFields.vetPhone && (
                <a className={styles.phoneLink} href={`tel:${criticalFields.vetPhone}`}>
                  {criticalFields.vetPhone}
                </a>
              )}
            </div>
          ) : (
            <p className={styles.empty}>No vet contact listed.</p>
          )}
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Insurance</h2>
          {criticalFields.insuranceProvider || criticalFields.insurancePolicyNumber ? (
            <div className={styles.contact}>
              {criticalFields.insuranceProvider && (
                <p className={styles.contactPrimary}>{criticalFields.insuranceProvider}</p>
              )}
              {criticalFields.insurancePolicyNumber && (
                <p className={styles.contactSecondary}>
                  Policy {criticalFields.insurancePolicyNumber}
                </p>
              )}
            </div>
          ) : (
            <p className={styles.empty}>No insurance information listed.</p>
          )}
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Microchip</h2>
          {criticalFields.microchipId ? (
            <p className={styles.mono}>{criticalFields.microchipId}</p>
          ) : (
            <p className={styles.empty}>No microchip number listed.</p>
          )}
        </section>

        <footer className={styles.footer}>
          <p>Updated {formatUpdatedAt(data.updatedAt)}</p>
          <p>For veterinary use only. Not a substitute for medical records.</p>
        </footer>
      </article>
    </main>
  );
}

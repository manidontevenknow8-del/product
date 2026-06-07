import { BUILD_INFO } from '@/data/buildInfo';
import { LEGAL_EFFECTIVE_DATE } from '@/data/legalConfig';
import {
  LegalPageLayout,
  LegalSection,
  LegalParagraph,
  LegalComingSoon,
} from '@/pages/legal/LegalPageLayout';
import styles from './SystemStatusPage.module.css';

const SERVICES = [
  { name: 'Web application', status: 'Operational' },
  { name: 'Authentication', status: 'Operational' },
  { name: 'Document storage', status: 'Operational' },
  { name: 'Notifications', status: 'Operational' },
  { name: 'Analytics', status: 'Operational' },
];

export function SystemStatusPage() {
  return (
    <LegalPageLayout
      title="System status"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      eyebrow="Status"
      intro={
        <LegalParagraph>
          Current operational status of PetClues services. Real-time incident tracking is coming
          soon.
        </LegalParagraph>
      }
      showHealthDisclaimer={false}
    >
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Version</div>
          <div className={styles.cardValue}>{BUILD_INFO.version}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Channel</div>
          <div className={styles.cardValue}>{BUILD_INFO.releaseChannel}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Environment</div>
          <div className={styles.cardValue}>{BUILD_INFO.environment}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Build date</div>
          <div className={styles.cardValue}>{BUILD_INFO.buildDate}</div>
        </div>
      </div>

      <LegalSection title="Services">
        <div className={styles.statusList}>
          {SERVICES.map((service) => (
            <div key={service.name} className={styles.statusItem}>
              <span className={styles.statusName}>{service.name}</span>
              <span className={`${styles.statusBadge} ${styles.operational}`}>
                {service.status}
              </span>
            </div>
          ))}
        </div>
      </LegalSection>

      <LegalComingSoon>
        Real-time status monitoring, incident history, and public status page integration are
        coming soon.
      </LegalComingSoon>

      <p className={styles.meta}>Commit: {BUILD_INFO.commitHash}</p>
    </LegalPageLayout>
  );
}

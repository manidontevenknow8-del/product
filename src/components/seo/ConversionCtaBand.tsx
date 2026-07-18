import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import styles from './ConversionCtaBand.module.css';

type ConversionCtaBandProps = {
  /** Optional override for the headline. */
  title?: string;
  /** Optional override for the supporting copy. */
  body?: string;
  /** Optional label override for the primary Genesis Vault CTA. */
  primaryLabel?: string;
  /** Optional label override for the free-sandbox CTA. */
  secondaryLabel?: string;
  /** Show the tertiary digital passport link. Defaults to true. */
  showPassportLink?: boolean;
  /** Accessible id for the heading (defaults to a stable value). */
  headingId?: string;
};

const DEFAULT_TITLE = 'Give your pet a lifetime medical vault';
const DEFAULT_BODY =
  '$249 lifetime Genesis allocation — white-glove digitization of veterinary histories, titers, imaging, and clinical timelines so every specialist, sitter, and border agent reads the same dossier.';

export function ConversionCtaBand({
  title = DEFAULT_TITLE,
  body = DEFAULT_BODY,
  primaryLabel = 'Secure Genesis Vault — $249',
  secondaryLabel = 'Start a free sandbox',
  showPassportLink = true,
  headingId = 'conversion-cta-heading',
}: ConversionCtaBandProps) {
  return (
    <aside className={styles.band} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.title}>
        {title}
      </h2>
      <p className={styles.body}>{body}</p>
      <div className={styles.actions}>
        <Link className={styles.primary} to={ROUTES.GENESIS}>
          {primaryLabel}
        </Link>
        <Link className={styles.secondary} to={ROUTES.SIGNUP}>
          {secondaryLabel}
        </Link>
        {showPassportLink && (
          <Link className={styles.tertiary} to={ROUTES.DIGITAL_PET_PASSPORT}>
            See digital passport
          </Link>
        )}
      </div>
    </aside>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import styles from './EditorialUpgradeModal.module.css';

const EDITORIAL_IMAGE_URL =
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80';

export type EditorialUpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  description: string;
  requiredTier?: 'Plus' | 'Pro';
  ctaLabel?: string;
};

export function EditorialUpgradeModal({
  isOpen,
  onClose,
  eyebrow = 'PetClues Plus',
  title,
  description,
  requiredTier = 'Plus',
  ctaLabel,
}: EditorialUpgradeModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const upgradeLabel = ctaLabel ?? `Upgrade to ${requiredTier}`;
  const pricingHref = `${ROUTES.PRICING}?plan=${requiredTier.toLowerCase()}`;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editorial-upgrade-title"
      >
        <button
          type="button"
          onClick={onClose}
          className={styles.close}
          aria-label="Close"
        >
          ×
        </button>

        <div className={styles.body}>
          <div className={styles.visual} aria-hidden>
            <img
              src={EDITORIAL_IMAGE_URL}
              alt=""
              className={`${styles.visualImg} ${imageLoaded ? styles.visualImgLoaded : ''}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
            />
            <div className={styles.visualScrim} />
          </div>

          <div className={styles.copy}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h2 id="editorial-upgrade-title" className={styles.title}>
              {title}
            </h2>
            <p className={styles.description}>{description}</p>
            <Link to={pricingHref} className={styles.cta} onClick={onClose}>
              {upgradeLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

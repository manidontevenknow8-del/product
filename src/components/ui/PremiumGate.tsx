import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { planMeetsTier } from '@/subscription/useFeatureAccess';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { ROUTES } from '@/routes/paths';
import styles from './PremiumGate.module.css';

/** Warm editorial placeholder — peaceful resting pet (Unsplash) */
const EDITORIAL_IMAGE_URL =
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80';

export type PremiumTier = 'Plus' | 'Pro';

export type PremiumGateProps = {
  /** Content shown blurred beneath the gate when access is denied */
  children: ReactNode;
  requiredTier: PremiumTier;
  title: string;
  description: string;
  /** Optional override for upgrade navigation */
  onUpgrade?: () => void;
  className?: string;
};

export function PremiumGate({
  children,
  requiredTier,
  title,
  description,
  onUpgrade,
  className = '',
}: PremiumGateProps) {
  const { currentPlan } = useSubscription();
  const [imageLoaded, setImageLoaded] = useState(false);

  if (planMeetsTier(currentPlan, requiredTier)) {
    return <>{children}</>;
  }

  const upgradeLabel = `Upgrade to ${requiredTier}`;
  const pricingHref = `${ROUTES.PRICING}?plan=${requiredTier.toLowerCase()}`;

  return (
    <div className={`${styles.root} ${className}`.trim()} data-tier={requiredTier}>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.blurredContent}>{children}</div>
      </div>

      <div className={styles.overlay} role="region" aria-label={`${requiredTier} feature`}>
        <div className={styles.prompt}>
          <div className={styles.visual} aria-hidden="true">
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
            <p className={styles.eyebrow}>PetClues {requiredTier}</p>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>

            {onUpgrade ? (
              <button type="button" className={styles.cta} onClick={onUpgrade}>
                {upgradeLabel}
              </button>
            ) : (
              <Link to={pricingHref} className={styles.cta}>
                {upgradeLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Badge, Button } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import {
  FOUNDING_DISCOUNT_PERCENT,
  FOUNDING_DISCOUNTED_PRICE_DISPLAY,
} from '@/config/razorpayConfig';
import { FOUNDING_TRIAL_DAYS } from '@/data/foundingMemberBenefits';
import { ROUTES } from '@/routes/paths';
import { FoundingFeatureVoting } from './FoundingFeatureVoting';
import styles from './FoundingBenefitsCard.module.css';

export function FoundingBenefitsCard() {
  const { user } = useAuth();

  if (!user?.foundingMember) return null;

  const trialEnd = user.foundingTrialEndsAt
    ? new Date(user.foundingTrialEndsAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const onTrial = user.subscriptionStatus === 'trialing';

  return (
    <section className={styles.card} aria-labelledby="founding-benefits-title">
      <div className={styles.hero}>
        <Badge variant="accent">Founding Member</Badge>
        <h2 id="founding-benefits-title" className={styles.title}>
          Your founding perks
        </h2>
        <p className={styles.lead}>
          Thank you for helping shape PetClues from day one. These benefits are active on your
          account.
        </p>
      </div>

      <ul className={styles.perks}>
        <li className={styles.perk}>
          <span className={styles.perkLabel}>Founding badge</span>
          <span className={styles.perkValue}>Visible on your profile and menu</span>
        </li>
        <li className={styles.perk}>
          <span className={styles.perkLabel}>Pro trial</span>
          <span className={styles.perkValue}>
            {onTrial && trialEnd
              ? `Active until ${trialEnd} (${FOUNDING_TRIAL_DAYS}-day trial)`
              : user.subscriptionStatus === 'active'
                ? 'Trial complete - Pro is active'
                : `Your ${FOUNDING_TRIAL_DAYS}-day trial starts when you finish signup`}
          </span>
        </li>
        <li className={styles.perk}>
          <span className={styles.perkLabel}>Lifetime discount</span>
          <span className={styles.perkValue}>
            {user.foundingLifetimeDiscount
              ? `Pro at ${FOUNDING_DISCOUNTED_PRICE_DISPLAY}/mo forever (${FOUNDING_DISCOUNT_PERCENT}% off)`
              : 'Applied at checkout when you upgrade'}
          </span>
        </li>
        <li className={styles.perk}>
          <span className={styles.perkLabel}>Early access</span>
          <span className={styles.perkValue}>Beta features roll out to founding members first</span>
        </li>
      </ul>

      {!user.subscriptionStatus || user.subscriptionStatus === 'inactive' ? (
        <div className={styles.cta}>
          <Link to={ROUTES.BILLING}>
            <Button variant="primary" size="md">
              View Pro & founding pricing
            </Button>
          </Link>
        </div>
      ) : null}

      <FoundingFeatureVoting userId={user.id} />
    </section>
  );
}

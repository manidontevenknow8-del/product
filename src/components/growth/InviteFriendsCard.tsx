import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useGrowth } from '@/growth';
import { ROUTES } from '@/routes/paths';
import styles from './InviteFriendsCard.module.css';

type InviteFriendsCardProps = {
  compact?: boolean;
  onShare?: () => void;
};

export function InviteFriendsCard({ compact = false, onShare }: InviteFriendsCardProps) {
  const { isOnWaitlist, member } = useGrowth();

  if (!isOnWaitlist || !member) {
    return (
      <article className={styles.card}>
        <div className={styles.content}>
          <h3 className={styles.title}>Invite friends</h3>
          <p className={styles.text}>
            Get your personal referral link and earn rewards when friends sign up.
          </p>
        </div>
        <Link to={ROUTES.REFERRALS}>
          <Button variant="secondary" size={compact ? 'sm' : 'md'}>
            Get referral link
          </Button>
        </Link>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.title}>Invite friends</h3>
        <p className={styles.text}>
          {member.referralCount > 0
            ? `${member.referralCount} friends joined so far. Keep sharing to unlock rewards.`
            : 'Share your link and earn rewards when friends create a free account.'}
        </p>
      </div>
      {onShare ? (
        <Button variant="secondary" size={compact ? 'sm' : 'md'} onClick={onShare}>
          Share link
        </Button>
      ) : (
        <Link to={ROUTES.REFERRALS}>
          <Button variant="secondary" size={compact ? 'sm' : 'md'}>
            Referrals
          </Button>
        </Link>
      )}
    </article>
  );
}

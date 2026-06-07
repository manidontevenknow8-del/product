import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/routes/paths';
import type { WaitlistMember } from '@/types/growth';
import styles from './WaitlistSuccess.module.css';

type WaitlistSuccessProps = {
  member: WaitlistMember;
  onShare?: () => void;
};

export function WaitlistSuccess({ member, onShare }: WaitlistSuccessProps) {
  return (
    <div className={styles.success}>
      <div className={styles.icon}>
        <div className={styles.check} />
      </div>

      <h2 className={styles.title}>You&apos;re on the list</h2>
      <p className={styles.text}>
        Welcome, {member.name.split(' ')[0]}. You&apos;re #{member.position.toLocaleString()} in
        line. Share your link to move up and unlock exclusive rewards.
      </p>

      <div className={styles.actions}>
        <Link to={ROUTES.REFERRALS}>
          <Button variant="primary" size="lg" fullWidth>
            Open referral dashboard
          </Button>
        </Link>
        {onShare && (
          <Button variant="secondary" size="md" fullWidth onClick={onShare}>
            Share your link
          </Button>
        )}
      </div>

      <p className={styles.code}>
        Your referral code
        <span className={styles.codeValue}>{member.referralCode}</span>
      </p>
    </div>
  );
}

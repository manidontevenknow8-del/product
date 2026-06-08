import { useState } from 'react';
import { Button } from '@/components/ui';
import type { WaitlistMember } from '@/types/growth';
import styles from './ReferralCard.module.css';

type ReferralCardProps = {
  member: WaitlistMember;
  referralUrl: string;
  onShare?: () => void;
};

export function ReferralCard({ member, referralUrl, onShare }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Your referral link</h2>
      <p className={styles.subtitle}>
        Every friend who creates a free account counts toward your rewards. Share
        thoughtfully - quality over quantity.
      </p>

      <div className={styles.linkBox}>
        <input
          className={styles.linkInput}
          value={referralUrl}
          readOnly
          aria-label="Referral link"
        />
        <Button variant="primary" size="md" onClick={copyLink}>
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      </div>

      <div className={styles.code}>
        <span>Referral code</span>
        <span className={styles.codeValue}>{member.referralCode}</span>
      </div>

      {copied && <span className={styles.copied}>Link copied to clipboard</span>}

      {onShare && (
        <Button variant="secondary" size="md" fullWidth onClick={onShare} className={styles.shareBtn}>
          More sharing options
        </Button>
      )}
    </article>
  );
}

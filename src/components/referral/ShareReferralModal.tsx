import { useEffect, useState } from 'react';
import type { WaitlistMember } from '@/types/growth';
import type { ShareChannel } from '@/types/growth';
import { buildShareMessage, buildShareUrls } from '@/utils/growthUtils';
import styles from './ShareReferralModal.module.css';

type ShareReferralModalProps = {
  isOpen: boolean;
  onClose: () => void;
  member: WaitlistMember;
  referralUrl: string;
  onShare?: (channel: ShareChannel) => void;
};

export function ShareReferralModal({
  isOpen,
  onClose,
  member,
  referralUrl,
  onShare,
}: ShareReferralModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const message = buildShareMessage(member, referralUrl);
  const urls = buildShareUrls(referralUrl, message);

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    onShare?.('copy');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-referral-title"
        style={{ position: 'relative' }}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className={styles.header}>
          <h2 id="share-referral-title" className={styles.title}>
            Share your link
          </h2>
          <p className={styles.subtitle}>
            Invite fellow pet parents — no pressure, just genuine recommendations.
          </p>
        </div>

        <div className={styles.options}>
          <button type="button" className={styles.option} onClick={copyLink}>
            <span className={styles.icon} aria-hidden="true" />
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          <a
            href={urls.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.option}
            onClick={() => onShare?.('whatsapp')}
          >
            <span className={styles.icon} aria-hidden="true" />
            WhatsApp
          </a>

          <a
            href={urls.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.option}
            onClick={() => onShare?.('twitter')}
          >
            <span className={styles.icon} aria-hidden="true" />
            X / Twitter
          </a>

          <a
            href={urls.email}
            className={styles.option}
            onClick={() => onShare?.('email')}
          >
            <span className={styles.icon} aria-hidden="true" />
            Email
          </a>

          <button
            type="button"
            className={`${styles.option} ${styles.optionDisabled}`}
            disabled
            title="Coming soon"
          >
            <span className={styles.icon} aria-hidden="true" />
            Instagram Story
          </button>

          <span className={styles.placeholder}>
            Instagram sharing coming soon — copy your link for now
          </span>
        </div>
      </div>
    </div>
  );
}

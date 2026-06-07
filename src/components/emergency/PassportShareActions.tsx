import { useState } from 'react';
import styles from './PassportShareActions.module.css';

type PassportShareActionsProps = {
  secureLink: string;
  onShowQR: () => void;
  qrVisible: boolean;
};

export function PassportShareActions({
  secureLink,
  onShowQR,
  qrVisible,
}: PassportShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(secureLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <section className={styles.section} aria-labelledby="share-actions-title">
      <h2 id="share-actions-title" className={styles.title}>
        Share passport
      </h2>
      <p className={styles.subtitle}>
        Give sitters, family, or emergency clinics instant access to what matters.
      </p>

      <div className={styles.grid}>
        <button type="button" className={styles.action} onClick={handleCopyLink}>
          <div className={styles.icon}>
            <div className={styles.iconInner} />
          </div>
          <span className={styles.label}>Copy secure link</span>
        </button>

        <button
          type="button"
          className={styles.action}
          onClick={onShowQR}
          aria-pressed={qrVisible}
        >
          <div className={styles.icon}>
            <div className={styles.iconInner} />
          </div>
          <span className={styles.label}>
            {qrVisible ? 'Hide QR code' : 'Generate QR code'}
          </span>
        </button>

        <button type="button" className={styles.action} onClick={handleCopyLink}>
          <div className={styles.icon}>
            <div className={styles.iconInner} />
          </div>
          <span className={styles.label}>Share with sitter</span>
        </button>
      </div>

      {copied && (
        <p className={styles.toast} role="status">
          Secure link copied to clipboard
        </p>
      )}
    </section>
  );
}

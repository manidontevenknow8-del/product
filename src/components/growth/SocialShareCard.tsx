import { buildShareUrls } from '@/utils/growthUtils';
import styles from './SocialShareCard.module.css';

type SocialShareCardProps = {
  referralUrl: string;
  onShare?: () => void;
};

const defaultMessage =
  "I've been using PetClues for my pet's health — join free with my link!";

export function SocialShareCard({ referralUrl, onShare }: SocialShareCardProps) {
  const urls = buildShareUrls(referralUrl, defaultMessage);

  return (
    <article className={styles.card}>
      <h3 className={styles.title}>Quick share</h3>
      <div className={styles.buttons}>
        <button
          type="button"
          className={styles.btn}
          onClick={async () => {
            await navigator.clipboard.writeText(referralUrl);
            onShare?.();
          }}
        >
          Copy link
        </button>
        <a
          href={urls.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btn}
        >
          WhatsApp
        </a>
        <a
          href={urls.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btn}
        >
          X / Twitter
        </a>
        <a href={urls.email} className={styles.btn}>
          Email
        </a>
        <span className={`${styles.btn} ${styles.btnDisabled}`} title="Coming soon">
          Instagram
        </span>
      </div>
    </article>
  );
}

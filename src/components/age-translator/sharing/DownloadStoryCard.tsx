import { Button } from '@/components/ui';
import styles from './DownloadStoryCard.module.css';

type DownloadStoryCardProps = {
  petName: string;
  onDownload?: () => void;
};

export function DownloadStoryCard({ petName, onDownload }: DownloadStoryCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Download for sharing</h2>
      <p className={styles.subtitle}>
        Save a beautiful story card featuring {petName}&apos;s age translation
        - perfect for Instagram, WhatsApp status, or messages to friends.
      </p>

      <div className={styles.formats}>
        <span className={`${styles.format} ${styles.formatActive}`}>Instagram Story</span>
        <span className={styles.format}>WhatsApp Status</span>
        <span className={styles.format}>Square post</span>
      </div>

      <Button variant="primary" size="md" className={styles.downloadBtn} onClick={onDownload}>
        Download story card (demo)
      </Button>

      <p className={styles.note}>
        Image export coming soon - use copy &amp; share for now
      </p>
    </article>
  );
}

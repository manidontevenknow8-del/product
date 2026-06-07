import { Button, Card } from '@/components/ui';
import styles from './MonthlyReportActions.module.css';

type MonthlyReportActionsProps = {
  onShare: () => void;
  onDownload: () => void;
  onSave: () => void;
  isDownloading?: boolean;
  isSaving?: boolean;
  saved?: boolean;
  isPremium?: boolean;
};

export function MonthlyReportActions({
  onShare,
  onDownload,
  onSave,
  isDownloading = false,
  isSaving = false,
  saved = false,
  isPremium = false,
}: MonthlyReportActionsProps) {
  return (
    <Card variant="elevated" className={styles.card}>
      <h2 className={styles.title}>Share your month</h2>
      <p className={styles.subtitle}>
        Download the full visual report, share with family, or save it to your archive.
      </p>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onShare}>
          Share
        </Button>
        <Button variant="primary" onClick={onDownload} disabled={isDownloading}>
          {isDownloading ? 'Preparing…' : isPremium ? 'Download' : 'Download · Pro'}
        </Button>
        <Button variant="ghost" onClick={onSave} disabled={isSaving || saved}>
          {saved ? 'Saved' : isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </Card>
  );
}


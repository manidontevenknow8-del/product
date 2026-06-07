import styles from './ScanEmptyState.module.css';

export function ScanEmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        <div className={styles.iconInner} />
      </div>
      <h3 className={styles.title}>Drop your document here</h3>
      <p className={styles.description}>
        Or tap below to choose a photo or PDF from your device
      </p>
      <span className={styles.hint}>PDF, JPG, PNG · up to 10 MB</span>
    </div>
  );
}

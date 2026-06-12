import styles from './GatedPagePreview.module.css';

type GatedPagePreviewProps = {
  imageUrl: string;
  eyebrow: string;
  title: string;
  subtitle: string;
};

/** Decorative blurred backdrop for full-page PremiumGate - no user data */
export function GatedPagePreview({
  imageUrl,
  eyebrow,
  title,
  subtitle,
}: GatedPagePreviewProps) {
  return (
    <div className={styles.root}>
      <img src={imageUrl} alt="" className={styles.image} aria-hidden />
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import type { RelatedLinkItem } from './RelatedLinks';
import styles from './ContinueReadingStrip.module.css';

export type ContinueReadingStripProps = {
  items: RelatedLinkItem[];
  heading?: string;
  className?: string;
};

export function ContinueReadingStrip({
  items,
  heading = 'Continue reading',
  className,
}: ContinueReadingStripProps) {
  const visible = items.slice(0, 3);
  if (visible.length === 0) return null;

  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-label={heading}>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.cards}>
        {visible.map((item) => (
          <li key={item.href} className={styles.card}>
            <Link to={item.href} className={styles.cardLink}>
              <span className={styles.cardLabel}>{item.label}</span>
              {item.description ? (
                <span className={styles.cardDesc}>{item.description}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

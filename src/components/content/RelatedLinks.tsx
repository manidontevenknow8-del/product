import { Link } from 'react-router-dom';
import styles from './RelatedLinks.module.css';

export type RelatedLinkItem = {
  href: string;
  label: string;
  description?: string;
};

export type RelatedLinksProps = {
  items: RelatedLinkItem[];
  heading?: string;
  className?: string;
};

/** Renders up to 6 related-page links for internal SEO hubs. */
export function RelatedLinks({ items, heading = 'Related guides', className }: RelatedLinksProps) {
  const visible = items.slice(0, 6);
  if (visible.length === 0) return null;

  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <nav className={classes} aria-label={heading}>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.list}>
        {visible.map((item) => (
          <li key={item.href} className={styles.item}>
            <Link to={item.href} className={styles.link}>
              <span className={styles.label}>{item.label}</span>
              {item.description ? (
                <span className={styles.description}>{item.description}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

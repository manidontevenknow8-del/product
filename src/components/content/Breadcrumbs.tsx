import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

export type BreadcrumbPathItem = {
  label: string;
  href?: string;
};

export type ContentBreadcrumbsProps = {
  /** Ordered trail from home/section to current page. Last item is current. */
  path: BreadcrumbPathItem[];
  className?: string;
};

/**
 * Content-system breadcrumbs. Separate from src/components/seo/Breadcrumbs
 * so content agents can pass a simple path[] without SEO schema types.
 */
export function Breadcrumbs({ path, className }: ContentBreadcrumbsProps) {
  if (path.length === 0) return null;

  const classes = [styles.nav, className].filter(Boolean).join(' ');

  return (
    <nav className={classes} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {path.map((item, index) => {
          const isLast = index === path.length - 1;
          return (
            <li key={`${item.label}-${item.href ?? index}`} className={styles.item}>
              {!isLast && item.href ? (
                <Link to={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

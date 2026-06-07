import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { BLOG_CATEGORIES, type BlogCategoryId } from '@/data/blogCategories';
import styles from './BlogCategoryNav.module.css';

export function BlogCategoryNav() {
  const [searchParams] = useSearchParams();
  const active = searchParams.get('category') as BlogCategoryId | null;

  return (
    <nav className={styles.nav} aria-label="Blog categories">
      <Link
        to={ROUTES.BLOG}
        className={`${styles.chip} ${!active ? styles.active : ''}`}
      >
        All
      </Link>
      {BLOG_CATEGORIES.map((category) => (
        <Link
          key={category.id}
          to={`${ROUTES.BLOG}?category=${category.id}`}
          className={`${styles.chip} ${active === category.id ? styles.active : ''}`}
        >
          {category.label}
        </Link>
      ))}
    </nav>
  );
}

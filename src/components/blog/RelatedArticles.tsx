import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import type { BlogPostListItem } from '@/types/blog';
import styles from './RelatedArticles.module.css';

type RelatedArticlesProps = {
  posts: BlogPostListItem[];
};

export function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="related-articles-heading">
      <h2 id="related-articles-heading" className={styles.title}>
        Related guides
      </h2>
      <ul className={styles.list}>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`${ROUTES.BLOG}/${post.slug}`} className={styles.link}>
              <span className={styles.postTitle}>{post.title}</span>
              <span className={styles.excerpt}>{post.excerpt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

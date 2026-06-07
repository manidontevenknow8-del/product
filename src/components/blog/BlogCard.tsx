import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { getBlogCategoryLabel } from '@/data/blogCategories';
import type { BlogPostListItem } from '@/types/blog';
import { resolveBlogFeaturedImage } from '@/services/blog/resolveBlogImage';
import styles from './BlogCard.module.css';

type BlogCardProps = {
  post: BlogPostListItem;
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function BlogCard({ post }: BlogCardProps) {
  const href = `${ROUTES.BLOG}/${post.slug}`;
  const imageSrc = resolveBlogFeaturedImage(post.slug, post.featuredImage);

  return (
    <article className={styles.card}>
      <Link to={href} className={styles.imageLink}>
        {imageSrc ? (
          <img src={imageSrc} alt={post.title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden />
        )}
      </Link>
      <div className={styles.body}>
        <span className={styles.category}>{getBlogCategoryLabel(post.category)}</span>
        <h2 className={styles.title}>
          <Link to={href}>{post.title}</Link>
        </h2>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.meta}>
          <span>{post.author}</span>
          {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
        </div>
      </div>
    </article>
  );
}

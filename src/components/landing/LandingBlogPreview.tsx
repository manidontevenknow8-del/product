import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { SEO_BLOG_POSTS } from '@/services/blog/seoBlogPosts';
import { resolveBlogFeaturedImage } from '@/services/blog/resolveBlogImage';
import { getBlogCategoryLabel } from '@/data/blogCategories';
import { ROUTES } from '@/routes/paths';
import styles from './LandingBlogPreview.module.css';

const PREVIEW_POSTS = SEO_BLOG_POSTS.slice(0, 3);

export function LandingBlogPreview() {
  return (
    <section id="pet-health-guides" className={styles.section} aria-labelledby="blog-preview-heading">
      <div className="container">
        <div className={styles.header}>
          <span className={`label ${styles.eyebrow}`}>Pet health guides</span>
          <h2 id="blog-preview-heading" className={styles.title}>
            Free guides on pet records, vaccines &amp; daily care
          </h2>
          <p className={styles.subtitle}>
            Search-friendly articles on puppy vaccination schedules, cat health records, medication
            reminders, and emergency pet information — written for pet parents and Google alike.
          </p>
        </div>

        <div className={styles.grid}>
          {PREVIEW_POSTS.map((post) => {
            const imageSrc = resolveBlogFeaturedImage(post.slug, post.featuredImage);
            return (
            <article key={post.slug} className={styles.card}>
              {imageSrc && (
                <Link to={`${ROUTES.BLOG}/${post.slug}`} className={styles.mediaLink}>
                  <img
                    src={imageSrc}
                    alt={post.title}
                    className={styles.image}
                    loading="lazy"
                  />
                </Link>
              )}
              <div className={styles.body}>
                <span className={styles.category}>{getBlogCategoryLabel(post.category)}</span>
                <h3 className={styles.cardTitle}>
                  <Link to={`${ROUTES.BLOG}/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className={styles.excerpt}>{post.excerpt}</p>
                <Link to={`${ROUTES.BLOG}/${post.slug}`} className={styles.readMore}>
                  Read guide →
                </Link>
              </div>
            </article>
          );
          })}
        </div>

        <div className={styles.actions}>
          <Link to={ROUTES.BLOG}>
            <Button variant="secondary" size="lg">
              Browse all pet health articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

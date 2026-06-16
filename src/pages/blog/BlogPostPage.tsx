import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button, Badge, LoadingState } from '@/components/ui';
import { EmptyFallback } from '@/components/errors/EmptyFallback';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { BlogPostBody } from '@/components/blog/BlogPostBody';
import { RelatedArticles } from '@/components/blog/RelatedArticles';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { BlogArticleNotFoundSEO, BlogPostSEO } from '@/seo/blogSeo';
import { getBlogPostBreadcrumbs } from '@/seo/pageBreadcrumbs';
import { getBlogRepository } from '@/services/blog';
import { resolveBlogFeaturedImage } from '@/services/blog/resolveBlogImage';
import { getBlogCategoryLabel } from '@/data/blogCategories';
import type { BlogPost, BlogPostListItem } from '@/types/blog';
import { ROUTES } from '@/routes/paths';
import { getRelatedBlogPosts } from '@/utils/blogRelatedPosts';
import styles from './BlogPostPage.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function estimateReadMinutes(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const repo = getBlogRepository();

    Promise.all([repo.getPublishedBySlug(slug), repo.listPublished()])
      .then(([data, posts]) => {
        if (!cancelled) {
          setPost(data);
          setAllPosts(posts);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getUserFacingError(err, 'generic', 'Failed to load article'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const heroImage = post ? resolveBlogFeaturedImage(post.slug, post.featuredImage) : null;
  const breadcrumbs = post ? getBlogPostBreadcrumbs(post.title, post.slug) : [];
  const relatedPosts = useMemo(
    () => (post ? getRelatedBlogPosts(post, allPosts) : []),
    [post, allPosts],
  );

  return (
    <PublicLayout>
      {post && <BlogPostSEO post={post} />}
      {!loading && !post && slug && <BlogArticleNotFoundSEO slug={slug} />}
      <div className={styles.page}>
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}

        {loading && (
          <div className={styles.stateWrap}>
            <LoadingState message="Loading article" />
          </div>
        )}

        {error && (
          <div className={styles.stateWrap}>
            <EmptyFallback
              title="Could not load article"
              message={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {!loading && !error && !post && (
          <div className={styles.stateWrap}>
            <EmptyFallback
              title="Article not found"
              message="This post may have moved or is not published yet."
              onRetry={undefined}
            />
            <div className={styles.notFoundAction}>
              <Link to={ROUTES.BLOG}>
                <Button variant="secondary">Browse all articles</Button>
              </Link>
            </div>
          </div>
        )}

        {post && (
          <article className={styles.article}>
            <header className={`${styles.header} ${heroImage ? styles.headerWithImage : ''}`}>
              {heroImage && (
                <div className={styles.headerMedia}>
                  <img
                    src={heroImage}
                    alt=""
                    className={styles.headerBg}
                    aria-hidden
                    width={1200}
                    height={630}
                    decoding="async"
                  />
                  <div className={styles.headerScrim} aria-hidden />
                </div>
              )}
              <div className={styles.headerInner}>
                <Badge variant="dark">{getBlogCategoryLabel(post.category)}</Badge>
                <h1 className={styles.title}>{post.title}</h1>
                <div className={styles.meta}>
                  <span>{post.author}</span>
                  <span>{estimateReadMinutes(post.content)} min read</span>
                  {post.publishedAt && (
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  )}
                </div>
                {post.tags.length > 0 && (
                  <ul className={styles.tags}>
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <Link to={`${ROUTES.BLOG}?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </header>

            <div className={styles.prose}>
              <BlogPostBody content={post.content} />
            </div>

            <RelatedArticles posts={relatedPosts} />

            <footer className={styles.footer}>
              <p>
                Organize pet health records, vaccination reminders, and emergency pet passports
                with PetClues - free for one pet.
              </p>
              <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
              <Link to={ROUTES.SIGNUP}>
                <Button variant="primary">Start free</Button>
              </Link>
            </footer>
          </article>
        )}
      </div>
    </PublicLayout>
  );
}

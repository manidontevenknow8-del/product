import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import { EmptyFallback } from '@/components/errors/EmptyFallback';
import { PageHeroBand, SectionIntro } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogCategoryNav } from '@/components/blog/BlogCategoryNav';
import { BlogIndexSEO } from '@/seo/blogSeo';
import { getBlogRepository } from '@/services/blog';
import { BLOG_CATEGORIES, type BlogCategoryId } from '@/data/blogCategories';
import type { BlogPostListItem } from '@/types/blog';
import { ROUTES } from '@/routes/paths';
import styles from './BlogIndexPage.module.css';

function parseCategory(value: string | null): BlogCategoryId | undefined {
  if (!value) return undefined;
  return BLOG_CATEGORIES.some((c) => c.id === value) ? (value as BlogCategoryId) : undefined;
}

export function BlogIndexPage() {
  const [searchParams] = useSearchParams();
  const category = parseCategory(searchParams.get('category'));
  const tag = searchParams.get('tag') ?? undefined;
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeCategory = useMemo(
    () => BLOG_CATEGORIES.find((c) => c.id === category),
    [category],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getBlogRepository()
      .listPublished({
        ...(category ? { category } : {}),
        ...(tag ? { tag } : {}),
      })
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load blog posts');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, tag]);

  const heroTitle = activeCategory
    ? activeCategory.label
    : 'Pet health guides - records, vaccines & reminders';

  const heroSubtitle = activeCategory
    ? activeCategory.description
    : 'SEO-friendly guides on puppy vaccination schedules, cat health records, medication reminders, vet bills, and emergency pet information.';

  const countMeta =
    !loading && posts.length > 0
      ? `${posts.length} ${posts.length === 1 ? 'article' : 'articles'}${tag ? ` tagged “${tag}”` : ''}`
      : undefined;

  return (
    <PublicLayout>
      <BlogIndexSEO posts={posts} />
      <div className={styles.page}>
        <PageHeroBand
          image={PAGE_IMG.app.trust}
          imageAlt=""
          eyebrow="PetClues Blog"
          title={heroTitle}
          subtitle={heroSubtitle}
          meta={countMeta}
        />

        <div className={styles.body}>
          <SectionIntro
            eyebrow="Browse"
            title={activeCategory ? `Articles in ${activeCategory.label}` : 'Latest guides'}
            description="Practical advice for pet parents - from first vaccines to emergency preparedness."
          />

          <BlogCategoryNav />

          {loading && (
            <div className={styles.stateWrap}>
              <LoadingState message="Loading articles" />
            </div>
          )}

          {error && (
            <div className={styles.stateWrap}>
              <EmptyFallback
                title="Could not load articles"
                message={error}
                onRetry={() => window.location.reload()}
              />
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className={styles.stateWrap}>
              <EmptyState
                title="No articles yet"
                description={
                  activeCategory
                    ? `We have not published guides in ${activeCategory.label} yet. Try another category or check back soon.`
                    : 'New pet health guides are on the way. Check back soon.'
                }
                action={
                  activeCategory ? (
                    <Link to={ROUTES.BLOG}>
                      <Button variant="secondary">Browse all articles</Button>
                    </Link>
                  ) : undefined
                }
              />
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className={styles.grid}>
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <section className={styles.cta}>
            <img src={PAGE_IMG.app.cta} alt="" className={styles.ctaImage} aria-hidden />
            <div className={styles.ctaCopy}>
              <h2>Ready to organize your pet&apos;s care?</h2>
              <p>Turn health records, reminders, and emergency info into one calm system.</p>
              <Link to={ROUTES.SIGNUP}>
                <Button variant="primary">Get started free</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}

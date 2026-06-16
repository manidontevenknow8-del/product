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
import { getBlogIndexBreadcrumbs } from '@/seo/pageBreadcrumbs';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { getBlogRepository } from '@/services/blog';
import { BLOG_CATEGORIES, type BlogCategoryId } from '@/data/blogCategories';
import type { BlogPostListItem } from '@/types/blog';
import { ROUTES } from '@/routes/paths';
import styles from './BlogIndexPage.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

function parseCategory(value: string | null): BlogCategoryId | undefined {
  if (!value) return undefined;
  return BLOG_CATEGORIES.some((c) => c.id === value) ? (value as BlogCategoryId) : undefined;
}

export function BlogIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = parseCategory(searchParams.get('category'));
  const tag = searchParams.get('tag') ?? undefined;
  const search = searchParams.get('q') ?? undefined;
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
        ...(search ? { search } : {}),
      })
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getUserFacingError(err, 'generic', 'Failed to load blog posts'));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, tag, search]);

  const heroTitle = activeCategory
    ? activeCategory.label
    : 'Pet health guides - records, vaccines & reminders';

  const heroSubtitle = activeCategory
    ? activeCategory.description
    : 'SEO-friendly guides on puppy vaccination schedules, cat health records, medication reminders, vet bills, and emergency pet information.';

  const countMeta =
    !loading && posts.length > 0
      ? `${posts.length} ${posts.length === 1 ? 'article' : 'articles'}${tag ? ` tagged “${tag}”` : ''}${search ? ` matching “${search}”` : ''}`
      : undefined;

  const breadcrumbItems = getBlogIndexBreadcrumbs(activeCategory?.label);

  return (
    <PublicLayout>
      <BlogIndexSEO posts={posts} category={category} tag={tag} search={search} />
      <div className={styles.page}>
        <Breadcrumbs items={breadcrumbItems} />
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

          <form
            className={styles.search}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const input = form.elements.namedItem('q') as HTMLInputElement;
              const next = new URLSearchParams(searchParams);
              const value = input.value.trim();
              if (value) {
                next.set('q', value);
              } else {
                next.delete('q');
              }
              next.delete('tag');
              setSearchParams(next);
            }}
          >
            <label className={styles.searchLabel} htmlFor="blog-search">
              Search guides
            </label>
            <div className={styles.searchRow}>
              <input
                id="blog-search"
                name="q"
                type="search"
                defaultValue={search ?? ''}
                placeholder="Vaccination schedule, reminders, vet bills…"
                className={styles.searchInput}
              />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </div>
          </form>

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

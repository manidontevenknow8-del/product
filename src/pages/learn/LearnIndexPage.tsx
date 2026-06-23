import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { LEARN_CATEGORIES, type LearnCategoryId } from '@/data/learn/categories';
import { FeaturedBlogLinks } from '@/components/seo/FeaturedBlogLinks';
import { LEARN_ARTICLE_COUNT, listLearnArticles } from '@/data/learn';
import { LearnIndexSEO, getLearnIndexBreadcrumbs } from '@/seo/learnSeo';
import { ROUTES } from '@/routes/paths';
import styles from './LearnIndexPage.module.css';

function parseCategory(value: string | null): LearnCategoryId | undefined {
  if (!value) return undefined;
  return LEARN_CATEGORIES.some((c) => c.id === value) ? (value as LearnCategoryId) : undefined;
}

export function LearnIndexPage() {
  const [searchParams] = useSearchParams();
  const category = parseCategory(searchParams.get('category'));
  const articles = listLearnArticles(category ? { category } : undefined);
  const activeCategory = LEARN_CATEGORIES.find((c) => c.id === category);

  return (
    <>
      <LearnIndexSEO
        articles={articles}
        category={category}
      />
      <Header variant="landing" />
      <div className={styles.indexPage}>
        <div className={styles.inner}>
          <Breadcrumbs items={getLearnIndexBreadcrumbs(activeCategory?.label)} />

          <header className={styles.hero}>
                <h1 className={styles.title}>
                  {activeCategory ? `${activeCategory.label} guides` : 'PetClues Learn'}
                </h1>
                <p className={styles.lead}>
                  {activeCategory
                    ? activeCategory.description
                    : `${LEARN_ARTICLE_COUNT} expert guides covering what to do, why it matters, how to execute, and how PetClues keeps your pet's care organized.`}
                </p>
              </header>

              {!activeCategory && <FeaturedBlogLinks title="Related blog guides" />}

              <nav className={styles.categories} aria-label="Learn categories">
            <Link
              to={ROUTES.LEARN}
              className={`${styles.categoryChip} ${!category ? styles.categoryChipActive : ''}`}
            >
              All
            </Link>
            {LEARN_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`${ROUTES.LEARN}?category=${cat.id}`}
                className={`${styles.categoryChip} ${category === cat.id ? styles.categoryChipActive : ''}`}
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          <div className={styles.grid}>
            {articles.map((article) => (
              <Link
                key={article.slug}
                to={`${ROUTES.LEARN}/${article.slug}`}
                className={styles.card}
              >
                <span className={styles.cardCategory}>
                  {LEARN_CATEGORIES.find((c) => c.id === article.categoryId)?.label}
                </span>
                <h2 className={styles.cardTitle}>
                  {article.title.replace(' | PetClues Learn', '')}
                </h2>
                <p className={styles.cardDesc}>{article.excerpt}</p>
                <span className={styles.cardMeta}>
                  {article.readMinutes} min read · Read guide →
                </span>
              </Link>
            ))}
              </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

import { Link, useSearchParams } from 'react-router-dom';
import { type FormEvent, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { FAQ_HUB_COUNT, listFaqItems } from '@/data/faq';
import { FAQ_CATEGORIES, type FaqCategoryId } from '@/data/faq/categories';
import { FaqIndexSEO, getFaqIndexBreadcrumbs } from '@/seo/faqHubSeo';
import { ROUTES } from '@/routes/paths';
import styles from './FaqHubPage.module.css';

function parseCategory(value: string | null): FaqCategoryId | undefined {
  if (!value) return undefined;
  return FAQ_CATEGORIES.some((c) => c.id === value) ? (value as FaqCategoryId) : undefined;
}

export function FaqHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = parseCategory(searchParams.get('category'));
  const search = searchParams.get('q') ?? undefined;
  const [query, setQuery] = useState(search ?? '');

  const items = listFaqItems({ category, search });
  const activeCategory = FAQ_CATEGORIES.find((c) => c.id === category);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    const trimmed = query.trim();
    if (trimmed) next.set('q', trimmed);
    else next.delete('q');
    setSearchParams(next);
  }

  return (
    <>
      <FaqIndexSEO items={items} category={category} search={search} />
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs items={getFaqIndexBreadcrumbs(activeCategory?.label)} />

          <header className={styles.hero}>
            <h1 className={styles.title}>
              {activeCategory ? `${activeCategory.label} FAQ` : 'Pet health FAQ center'}
            </h1>
            <p className={styles.lead}>
              {activeCategory
                ? activeCategory.description
                : `${FAQ_HUB_COUNT} searchable answers on pet records, vaccinations, passports, travel, medications, and emergencies.`}
            </p>
          </header>

          <form className={styles.searchForm} onSubmit={handleSearch} role="search">
            <label className={styles.searchLabel} htmlFor="faq-search">
              Search FAQs
            </label>
            <div className={styles.searchRow}>
              <input
                id="faq-search"
                className={styles.searchInput}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. organize pet records, vaccination proof, pet passport"
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </div>
          </form>

          <nav className={styles.categories} aria-label="FAQ categories">
            <Link
              to={ROUTES.FAQ}
              className={`${styles.categoryChip} ${!category ? styles.categoryChipActive : ''}`}
            >
              All
            </Link>
            {FAQ_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`${ROUTES.FAQ}?category=${cat.id}`}
                className={`${styles.categoryChip} ${category === cat.id ? styles.categoryChipActive : ''}`}
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          <p className={styles.resultMeta}>
            {items.length} {items.length === 1 ? 'answer' : 'answers'}
            {search ? ` for “${search}”` : ''}
          </p>

          <div className={styles.list}>
            {items.map((item) => (
              <details key={item.slug} className={styles.faqItem} id={item.slug}>
                <summary className={styles.faqQuestion}>
                  <Link to={`${ROUTES.FAQ}/${item.slug}`} className={styles.faqQuestionLink}>
                    {item.question}
                  </Link>
                </summary>
                <div className={styles.faqAnswer}>
                  <p>{item.shortAnswer}</p>
                  <Link to={`${ROUTES.FAQ}/${item.slug}`} className={styles.readMore}>
                    Read full answer →
                  </Link>
                </div>
              </details>
            ))}
          </div>

          {items.length === 0 && (
            <p className={styles.empty}>
              No FAQs match your search. Try broader terms like “vaccination”, “travel”, or “records”.
            </p>
          )}

          <footer className={styles.cta}>
            <p>Organize records, reminders, and emergency passports with PetClues.</p>
            <Link to={ROUTES.SIGNUP} className={styles.ctaLink}>
              Start free
            </Link>
          </footer>
        </div>
      </div>
      <Footer />
    </>
  );
}

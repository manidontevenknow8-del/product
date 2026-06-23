import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { listIndexableComparisonPages } from '@/data/comparisons';
import { resolveCompareHref } from '@/data/comparisons/compareRedirects';
import { FeaturedBlogLinks } from '@/components/seo/FeaturedBlogLinks';
import { CompareIndexSEO, getCompareIndexBreadcrumbs } from '@/seo/compareSeo';
import { ROUTES } from '@/routes/paths';
import styles from './CompareIndexPage.module.css';

export function CompareIndexPage() {
  const pages = listIndexableComparisonPages();
  const indexableCount = pages.length;

  return (
    <>
      <CompareIndexSEO pages={pages} />
      <Header variant="landing" />
      <div className={styles.indexPage}>
        <div className={styles.inner}>
          <Breadcrumbs items={getCompareIndexBreadcrumbs()} />

          <header className={styles.hero}>
                <h1 className={styles.title}>PetClues comparisons &amp; alternatives</h1>
                <p className={styles.lead}>
                  {indexableCount} in-depth guides comparing PetClues with spreadsheets, cloud
                  storage, notes apps, and pet health tools, for vaccination reminders, vet bills,
                  and emergency pet info. For best-of roundups, see our{' '}
                  <Link to={ROUTES.BEST}>best pet health apps</Link> hub.
                </p>
              </header>

              <FeaturedBlogLinks title="Popular comparison reads" />

              <div className={styles.grid}>
                {pages.map((page) => (
                  <Link
                    key={page.slug}
                    to={resolveCompareHref(page.slug)}
                    className={styles.card}
                  >
                    <h2 className={styles.cardTitle}>
                      {page.title.replace(' | PetClues', '')}
                    </h2>
                    <p className={styles.cardDesc}>{page.metaDescription}</p>
                    <span className={styles.cardLink}>Read comparison →</span>
                  </Link>
                ))}
              </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

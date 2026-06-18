import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { listComparisonPages, COMPARISON_PAGE_COUNT } from '@/data/comparisons';
import { CompareIndexSEO, getCompareIndexBreadcrumbs } from '@/seo/compareSeo';
import { ROUTES } from '@/routes/paths';
import styles from './CompareIndexPage.module.css';

export function CompareIndexPage() {
  const pages = listComparisonPages();

  return (
    <>
      <CompareIndexSEO pages={pages} />
      <Header variant="landing" />
      <div className={styles.indexPage}>
        <div className={styles.inner}>
          <Breadcrumbs items={getCompareIndexBreadcrumbs()} />

          <header className={styles.hero}>
            <h1 className={styles.title}>PetClues comparisons & alternatives</h1>
            <p className={styles.lead}>
              {COMPARISON_PAGE_COUNT} in-depth guides comparing PetClues with spreadsheets, cloud
              storage, notes apps, pet health tools, and manual record keeping — so you can choose
              the right system for vaccination reminders, vet bills, and emergency pet info.
            </p>
          </header>

          <div className={styles.grid}>
            {pages.map((page) => (
              <Link
                key={page.slug}
                to={`${ROUTES.COMPARE}/${page.slug}`}
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

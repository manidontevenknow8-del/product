import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { listIntentPages, INTENT_PAGE_COUNT } from '@/data/intent';
import { IntentIndexSEO, getIntentIndexBreadcrumbs } from '@/seo/intentSeo';
import { ROUTES } from '@/routes/paths';
import styles from './BestIndexPage.module.css';

export function BestIndexPage() {
  const pages = listIntentPages();

  return (
    <>
      <IntentIndexSEO pages={pages} />
      <Header variant="landing" />
      <div className={styles.indexPage}>
        <div className={styles.inner}>
          <Breadcrumbs items={getIntentIndexBreadcrumbs()} />

          <header className={styles.hero}>
            <h1 className={styles.title}>Best pet health apps & tools</h1>
            <p className={styles.lead}>
              {INTENT_PAGE_COUNT} intent-focused guides for pet owners searching for the best health
              record apps, vaccination trackers, reminder tools, digital passports, and all-in-one
              care platforms — with comparisons, authoritative citations, and FAQs.
            </p>
          </header>

          <div className={styles.grid}>
            {pages.map((page) => (
              <Link key={page.slug} to={`${ROUTES.BEST}/${page.slug}`} className={styles.card}>
                <h2 className={styles.cardTitle}>{page.intentLabel}</h2>
                <p className={styles.cardDesc}>{page.quickAnswer}</p>
                <span className={styles.cardLink}>Read guide →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

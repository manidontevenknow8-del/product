import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import {
  listFlaggedComparisons,
  listPublishableComparisons,
  toComparePagePath,
  toComparePageSlug,
} from '@/content/comparisons';
import { FeaturedBlogLinks } from '@/components/seo/FeaturedBlogLinks';
import { CompareIndexSEO, getCompareIndexBreadcrumbs } from '@/seo/compareSeo';
import { ROUTES } from '@/routes/paths';
import styles from './CompareIndexPage.module.css';

export function CompareIndexPage() {
  const records = listPublishableComparisons();
  const flagged = listFlaggedComparisons();
  const indexPages = records.map((record) => ({
    slug: toComparePageSlug(record.slug),
    title: `PetClues vs ${record.name}`,
  }));

  return (
    <>
      <CompareIndexSEO pages={indexPages} />
      <Header variant="landing" />
      <div className={styles.indexPage}>
        <div className={styles.inner}>
          <Breadcrumbs items={getCompareIndexBreadcrumbs()} />

          <header className={styles.hero}>
            <h1 className={styles.title}>PetClues comparisons &amp; alternatives</h1>
            <p className={styles.lead}>
              {records.length} verified head-to-head pages (features cited from primary sources only).
              CTA on every page: founding member pricing. For best-of roundups, see our{' '}
              <Link to={ROUTES.BEST}>best pet health apps</Link> hub.
            </p>
          </header>

          <FeaturedBlogLinks title="Popular comparison reads" />

          <div className={styles.grid}>
            {records.map((record) => (
              <Link
                key={record.slug}
                to={toComparePagePath(record.slug)}
                className={styles.card}
              >
                <h2 className={styles.cardTitle}>PetClues vs {record.name}</h2>
                <p className={styles.cardDesc}>
                  {record.features.length} verified feature rows ·{' '}
                  {record.category.replace(/-/g, ' ')}
                </p>
                <span className={styles.cardLink}>Read comparison →</span>
              </Link>
            ))}
          </div>

          {flagged.length > 0 ? (
            <section className={styles.hero} aria-label="Flagged incomplete comparisons">
              <h2 className={styles.title} style={{ fontSize: '1.25rem' }}>
                Flagged incomplete (pages skipped)
              </h2>
              <ul>
                {flagged.map((row) => (
                  <li key={row.slug}>
                    <strong>{row.name}</strong> ({row.slug}): {row.reasons.join('; ')}
                    {row.source_notes ? ` — ${row.source_notes}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CompareIndexPage;

import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Button } from '@/components/ui';
import { ComparisonTemplate } from '@/templates/ComparisonTemplate';
import {
  buildComparisonBody,
  buildComparisonFaqs,
  buildComparisonMetaDescription,
  buildComparisonPrimaryKeyword,
  getPublishableComparisonByPageSlug,
  listFlaggedComparisons,
  toComparePagePath,
} from '@/content/comparisons';
import { CompareNotFoundSEO } from '@/seo/compareSeo';
import { ROUTES } from '@/routes/paths';
import styles from './ComparePage.module.css';

export function ComparePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const competitor = slug ? getPublishableComparisonByPageSlug(slug) : undefined;
  const flagged = listFlaggedComparisons();
  const flaggedMatch = flagged.find((row) => `petclues-vs-${row.slug}` === slug);

  return (
    <>
      <Header variant="landing" />
      {!competitor && slug ? <CompareNotFoundSEO slug={slug} /> : null}

      {competitor ? (
        <ComparisonTemplate
          competitor={competitor}
          path={toComparePagePath(competitor.slug)}
          primaryKeyword={buildComparisonPrimaryKeyword(competitor)}
          metaDescription={buildComparisonMetaDescription(competitor)}
          body={buildComparisonBody(competitor)}
          faqs={buildComparisonFaqs(competitor)}
          noIndex={false}
          breadcrumbs={[
            { label: 'Home', href: ROUTES.LANDING },
            { label: 'Compare', href: ROUTES.COMPARE },
            { label: competitor.name },
          ]}
        />
      ) : (
        <div className={styles.comparePage}>
          <div className={styles.inner}>
            <div className={styles.stateWrap}>
              <h1>Comparison not found</h1>
              {flaggedMatch ? (
                <p>
                  <strong>{flaggedMatch.name}</strong> is flagged incomplete (
                  {flaggedMatch.reasons.join('; ')}
                  ). Pages are not published until every feature row has a verified source.
                </p>
              ) : (
                <p>That comparison page does not exist yet, or its record is incomplete.</p>
              )}
              <Link to={ROUTES.COMPARE}>
                <Button variant="secondary">Browse all comparisons</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default ComparePage;

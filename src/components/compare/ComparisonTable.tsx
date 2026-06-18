import { Link } from 'react-router-dom';
import { COMPARISON_FEATURES, ratingLabel } from '@/data/comparisons/features';
import type { ComparisonPage, ComparisonRating } from '@/types/comparison';
import styles from './ComparisonTable.module.css';

type ComparisonTableProps = {
  page: ComparisonPage;
};

function RatingCell({ rating }: { rating: ComparisonRating }) {
  return (
    <span className={`${styles.rating} ${styles[`rating_${rating}`]}`}>
      {ratingLabel(rating)}
    </span>
  );
}

export function ComparisonTable({ page }: ComparisonTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          Feature comparison: PetClues vs {page.competitorName}
        </caption>
        <thead>
          <tr>
            <th scope="col">Feature</th>
            <th scope="col">PetClues</th>
            <th scope="col">{page.competitorShortName}</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_FEATURES.map((feature) => (
            <tr key={feature.id}>
              <th scope="row">
                <span className={styles.featureLabel}>{feature.label}</span>
                <span className={styles.featureHint}>{feature.petcluesDescription}</span>
              </th>
              <td>
                <RatingCell rating="yes" />
              </td>
              <td>
                <RatingCell rating={page.featureRatings[feature.id]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type RelatedComparisonsProps = {
  pages: ComparisonPage[];
};

export function RelatedComparisons({ pages }: RelatedComparisonsProps) {
  if (pages.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="related-comparisons-heading">
      <h2 id="related-comparisons-heading" className={styles.relatedTitle}>
        Related comparisons
      </h2>
      <ul className={styles.relatedList}>
        {pages.map((item) => (
          <li key={item.slug}>
            <Link to={`/compare/${item.slug}`} className={styles.relatedLink}>
              {item.title.replace(' | PetClues', '')}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

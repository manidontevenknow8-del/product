import { Link } from 'react-router-dom';
import type { IntentComparisonOption, IntentPage } from '@/types/intentPage';
import { ROUTES } from '@/routes/paths';
import styles from './IntentComparisonTable.module.css';

type IntentComparisonTableProps = {
  comparisons: IntentComparisonOption[];
  intentLabel: string;
};

export function IntentComparisonTable({ comparisons, intentLabel }: IntentComparisonTableProps) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          Options compared for {intentLabel.toLowerCase()}
        </caption>
        <thead>
          <tr>
            <th scope="col">Option</th>
            <th scope="col">Type</th>
            <th scope="col">Best for</th>
            <th scope="col">Limitations</th>
            <th scope="col">PetClues advantage</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((option) => (
            <tr key={option.name}>
              <th scope="row">{option.name}</th>
              <td>{option.type}</td>
              <td>{option.bestFor}</td>
              <td>{option.limitations}</td>
              <td className={styles.advantage}>{option.petcluesAdvantage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type RelatedIntentPagesProps = {
  pages: IntentPage[];
};

export function RelatedIntentPages({ pages }: RelatedIntentPagesProps) {
  if (pages.length === 0) return null;

  return (
    <section className={styles.related} aria-labelledby="related-intent-heading">
      <h2 id="related-intent-heading" className={styles.relatedTitle}>
        Related guides
      </h2>
      <ul className={styles.relatedList}>
        {pages.map((page) => (
          <li key={page.slug}>
            <Link to={`${ROUTES.BEST}/${page.slug}`} className={styles.relatedLink}>
              {page.intentLabel}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

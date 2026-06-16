import type { EditorialBreedMatch } from '@/types/petMatchEditorial';
import styles from './PetMatchPortraitResults.module.css';

type PetMatchPortraitResultsProps = {
  matches: EditorialBreedMatch[];
};

export function PetMatchPortraitResults({ matches }: PetMatchPortraitResultsProps) {
  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Your matches</p>
        <h2 className={styles.title}>Three companions worth meeting</h2>
      </header>

      <div className={styles.grid}>
        {matches.map((match, index) => (
          <article key={match.id} className={styles.card}>
            <div className={styles.imageWrap}>
              <img
                src={match.imageUrl}
                alt={match.breed}
                className={styles.image}
                loading="lazy"
              />
              <div className={styles.imageScrim} aria-hidden />
              <div className={styles.imageCaption}>
                <p className={styles.matchMeta}>
                  Match #{index + 1} · {match.matchScore}% fit
                </p>
                <h3 className={styles.breedName}>{match.breed}</h3>
              </div>
            </div>
            <div className={styles.body}>
              <dl className={styles.stats}>
                <div>
                  <dt className={styles.statLabel}>Care difficulty</dt>
                  <dd className={styles.statValue}>{match.careDifficulty}</dd>
                </div>
                <div>
                  <dt className={styles.statLabel}>Est. monthly</dt>
                  <dd className={styles.statValue}>{match.monthlyCostLabel}</dd>
                </div>
              </dl>
              <p className={styles.reason}>{match.matchReason}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

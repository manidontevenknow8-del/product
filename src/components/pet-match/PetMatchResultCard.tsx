import { Badge, Card } from '@/components/ui';
import type { PetMatchResult } from '@/types/petMatch';
import styles from './PetMatchResultCard.module.css';

type PetMatchResultCardProps = {
  result: PetMatchResult;
};

export function PetMatchResultCard({ result }: PetMatchResultCardProps) {
  return (
    <Card variant="highlight" padding="lg" className={styles.card}>
      <div className={styles.header}>
        <Badge variant="accent">Compatibility Score</Badge>
        <p className={styles.score}>{result.compatibilityScore}%</p>
        <p className={styles.subtitle}>
          Best match species: <strong>{result.recommendedSpecies}</strong>
        </p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Care difficulty</span>
          <strong>{result.careDifficulty}</strong>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Monthly cost</span>
          <strong>
            ${result.estimatedMonthlyCost.min} - ${result.estimatedMonthlyCost.max}
          </strong>
        </div>
      </div>

      <section>
        <h3 className={styles.sectionTitle}>Why this fits your lifestyle</h3>
        <ul className={styles.list}>
          {result.fitSummary.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className={styles.sectionTitle}>Top breed recommendations</h3>
        <div className={styles.breeds}>
          {result.recommendedBreeds.map((breed) => (
            <article key={breed.breed} className={styles.breedItem}>
              <header className={styles.breedHeader}>
                <h4>{breed.breed}</h4>
                <Badge variant="dark">{breed.matchScore}% match</Badge>
              </header>
              <p className={styles.breedMeta}>
                {breed.species} · {breed.careDifficulty} care · ${breed.estimatedMonthlyCost.min}-
                ${breed.estimatedMonthlyCost.max}/mo
              </p>
              <ul className={styles.reasonList}>
                {breed.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </Card>
  );
}

import type { BreedConditionCitation } from '@/data/breedConditionAuthority';
import styles from './ClinicalReferences.module.css';

type ClinicalReferencesProps = {
  citations: BreedConditionCitation[];
};

export function ClinicalReferences({ citations }: ClinicalReferencesProps) {
  if (!citations.length) return null;

  return (
    <section className={styles.section} aria-labelledby="clinical-references-heading">
      <p className={styles.kicker}>E-E-A-T · peer review</p>
      <h2 id="clinical-references-heading" className={styles.title}>
        Clinical References &amp; Peer Review
      </h2>
      <ol className={styles.list}>
        {citations.map((citation, index) => (
          <li key={citation.url} className={styles.item}>
            <span className={styles.index}>[{index + 1}]</span>
            <div>
              <a
                className={styles.link}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer me"
              >
                {citation.name}
              </a>
              <p className={styles.source}>{citation.source}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

import { Link } from 'react-router-dom';
import type { BreedConditionMeta } from '@/data/breedConditions';
import { getRelatedClinicalProfiles } from '@/data/internalLinking/breedConditionLinks';
import styles from './RelatedClinicalProfiles.module.css';

type RelatedClinicalProfilesProps = {
  meta: BreedConditionMeta;
};

export function RelatedClinicalProfiles({ meta }: RelatedClinicalProfilesProps) {
  const { sameBreed, sameCondition } = getRelatedClinicalProfiles(meta, 8);
  if (sameBreed.length === 0 && sameCondition.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="related-clinical-heading">
      <p className={styles.kicker}>Clinical link graph</p>
      <h2 id="related-clinical-heading" className={styles.title}>
        Related Clinical Profiles
      </h2>
      <p className={styles.lead}>
        Cross-linked breed and condition dossiers so caregivers can follow the full risk cluster -
        not a single isolated page.
      </p>

      <div className={styles.grid}>
        {sameBreed.length > 0 && (
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>
              Other risks in {meta.breed}s
            </h3>
            <ul className={styles.list}>
              {sameBreed.map((link) => (
                <li key={link.href}>
                  <Link className={styles.link} to={link.href}>
                    <span className={styles.linkLabel}>{link.label}</span>
                    <span className={styles.badge} data-risk={link.riskLevel}>
                      {link.riskLevel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {sameCondition.length > 0 && (
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>
              {meta.condition} in other breeds
            </h3>
            <ul className={styles.list}>
              {sameCondition.map((link) => (
                <li key={link.href}>
                  <Link className={styles.link} to={link.href}>
                    <span className={styles.linkLabel}>{link.label}</span>
                    <span className={styles.badge} data-risk={link.riskLevel}>
                      {link.riskLevel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

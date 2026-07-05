import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
import { getAvatarInitials } from '@/services/pets/petUtils';
import styles from './MultiPetComparativeSection.module.css';

export type PetComparativeRow = {
  petId: string;
  petName: string;
  photoUrl: string | null;
  score: number;
  scoreLabel: string;
  trendText: string;
  weightSummary: string | null;
};

type MultiPetComparativeSectionProps = {
  rows: PetComparativeRow[];
  activePetId: string;
  onSelectPet: (petId: string) => void;
};

export function MultiPetComparativeSection({
  rows,
  activePetId,
  onSelectPet,
}: MultiPetComparativeSectionProps) {
  if (rows.length < 2) return null;

  return (
    <section className={styles.wrap} data-reveal aria-labelledby="multi-pet-heading">
      <p className={styles.eyebrow}>Household view</p>
      <h2 id="multi-pet-heading" className={styles.title}>
        Comparative care trends
      </h2>
      <p className={styles.lead}>
        Side-by-side PetCare scores and weight signals across every pet on your account.
      </p>

      <ul className={styles.grid}>
        {rows.map((row) => {
          const photo = normalizePhotoUrlFromDb(row.photoUrl);
          const isActive = row.petId === activePetId;

          return (
            <li key={row.petId}>
              <button
                type="button"
                className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
                onClick={() => onSelectPet(row.petId)}
                aria-pressed={isActive}
              >
                <div className={styles.cardHead}>
                  <span className={styles.avatar} aria-hidden>
                    {photo ? (
                      <img src={photo} alt="" className={styles.avatarImg} />
                    ) : (
                      <span className={styles.avatarInitials}>{getAvatarInitials(row.petName)}</span>
                    )}
                  </span>
                  <div>
                    <p className={styles.petName}>{row.petName}</p>
                    <p className={styles.scoreMeta}>
                      <span className={styles.scoreValue}>{row.score}</span>
                      <span>{row.scoreLabel}</span>
                    </p>
                  </div>
                </div>
                {row.trendText && <p className={styles.trend}>{row.trendText}</p>}
                {row.weightSummary && <p className={styles.weight}>{row.weightSummary}</p>}
                {isActive && <span className={styles.activeTag}>Viewing</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

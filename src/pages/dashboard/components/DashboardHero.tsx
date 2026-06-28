import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { EditorialUpgradeModal } from '@/components/ui';
import { usePets } from '@/pets';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { getAvatarInitials } from '@/services/pets/petUtils';
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { ROUTES } from '@/routes/paths';
import type { PetRecord } from '@/services/pets/petTypes';
import styles from '../../DashboardPage.module.css';

type DashboardHeroProps = {
  greeting: string;
  petName: string;
  meta: string;
  statusLine: string;
  checkInDone: boolean;
  pets: PetRecord[];
  activePetId: string;
  onSelectPet: (id: string) => void;
  photoUrl?: string | null;
};

export function DashboardHero({
  greeting,
  petName,
  meta,
  statusLine,
  checkInDone,
  pets,
  activePetId,
  onSelectPet,
  photoUrl,
}: DashboardHeroProps) {
  const hero = resolvePetHeroBackground(photoUrl);
  const navigate = useNavigate();
  const { pets: allPets } = usePets();
  const petAccess = useFeatureAccess('pets');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleAddPet = () => {
    if (petAccess.isAllowed) {
      navigate(`${ROUTES.ONBOARDING}?add=true`);
      return;
    }
    setUpgradeOpen(true);
  };

  return (
    <section className={styles.hero} aria-label={`${petName} overview`}>
      <img
        className={styles.heroImage}
        src={hero.src}
        alt=""
        aria-hidden
        data-pet-photo={hero.isPetPhoto ? 'true' : 'false'}
      />
      <div className={styles.heroScrim} aria-hidden />
      <div className={styles.heroVignette} aria-hidden />

      <div className={styles.heroLayout}>
        <div className={styles.heroMain}>
          <p className={styles.heroGreeting}>{greeting}</p>
          <h1 className={styles.heroName}>{petName}</h1>
          {meta && <p className={styles.heroMeta}>{meta}</p>}
          <p className={styles.heroSignal}>{statusLine}</p>

          <div className={styles.heroActions}>
            <a href="#ritual" className={styles.heroPrimary}>
              {checkInDone ? "Review today's log" : "Log today's check-in"}
            </a>
            <Link to={ROUTES.TIMELINE} className={styles.heroSecondary}>
              Open archive
            </Link>
          </div>
        </div>

        {pets.length > 0 && (
          <aside className={styles.heroAside} aria-label="Your pets">
            <p className={styles.heroAsideLabel}>Household</p>
            <div className={styles.petRail}>
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  className={`${styles.petRailBtn} ${pet.id === activePetId ? styles.petRailBtnActive : ''}`}
                  onClick={() => onSelectPet(pet.id)}
                  aria-label={pet.name}
                  title={pet.name}
                >
                  {pet.photoUrl ? (
                    <img src={pet.photoUrl} alt="" className={styles.petRailImg} />
                  ) : (
                    <span className={styles.petRailInitials}>{getAvatarInitials(pet.name)}</span>
                  )}
                  <span className={styles.petRailName}>{pet.name}</span>
                </button>
              ))}
            </div>
            {allPets.length > 0 && (
              <button type="button" className={styles.addPetLink} onClick={handleAddPet}>
                Add another pet
              </button>
            )}
          </aside>
        )}
      </div>

      <EditorialUpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        eyebrow="PetClues Plus"
        title="Your family is growing"
        description="Upgrade to Plus to manage up to 3 pets and unlock unlimited care history."
        requiredTier="Plus"
      />
    </section>
  );
}

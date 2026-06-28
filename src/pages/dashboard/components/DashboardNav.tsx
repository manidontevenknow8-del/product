import { Link, useLocation } from 'react-router-dom';
import { PETCLUES_LOGO_SRC } from '@/components/brand/PetCluesLogo';
import { useAuth } from '@/auth/AuthProvider';
import { getAvatarInitials } from '@/services/pets/petUtils';
import { ROUTES } from '@/routes/paths';
import type { PetRecord } from '@/services/pets/petTypes';
import styles from '../../DashboardPage.module.css';

const NAV_LINKS = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD },
  { label: 'Records', to: ROUTES.PET_PROFILE },
  { label: 'Timeline', to: ROUTES.TIMELINE },
  { label: 'Insights', to: ROUTES.PET_CARE_SCORE },
] as const;

type DashboardNavProps = {
  pets: PetRecord[];
  activePetId: string;
  onSelectPet: (id: string) => void;
  overHero?: boolean;
};

export function DashboardNav({ pets, activePetId, onSelectPet, overHero = false }: DashboardNavProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <header className={`${styles.nav}${overHero ? ` ${styles.navOverHero}` : ''}`}>
      <div className={styles.navInner}>
        <Link to={ROUTES.DASHBOARD} className={styles.logoLink}>
          <img src={PETCLUES_LOGO_SRC} alt="" className={styles.logoMark} aria-hidden />
          <span className={styles.logoWord}>PetClues</span>
        </Link>

        <nav className={styles.navLinks} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`${styles.navLink} ${pathname === link.to ? styles.navLinkActive : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.navRight}>
          {pets.slice(0, 5).map((pet) => (
            <button
              key={pet.id}
              type="button"
              aria-label={pet.name}
              title={pet.name}
              className={`${styles.navPetBtn} ${pet.id === activePetId ? styles.navPetBtnActive : ''}`}
              onClick={() => onSelectPet(pet.id)}
            >
              {pet.photoUrl ? (
                <img src={pet.photoUrl} alt="" className={styles.navPetImg} />
              ) : (
                <span className={styles.navPetInitials}>{getAvatarInitials(pet.name)}</span>
              )}
            </button>
          ))}
          <Link to={ROUTES.SETTINGS} className={styles.userAvatar} aria-label="Account">
            {user?.email?.slice(0, 2).toUpperCase() ?? 'PC'}
          </Link>
        </div>
      </div>
    </header>
  );
}

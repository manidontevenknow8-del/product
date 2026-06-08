import { Link } from 'react-router-dom';
import { PetCluesLogo } from '@/components/brand';
import { UserMenu } from '@/components/user';
import { ROUTES } from '@/routes/paths';
import styles from './TopNavigation.module.css';

type TopNavigationProps = {
  onMenuOpen?: () => void;
};

export function TopNavigation({ onMenuOpen }: TopNavigationProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to={ROUTES.DASHBOARD} className={styles.logo} aria-label="PetClues dashboard">
          <PetCluesLogo size="xl" />
        </Link>

        <div className={styles.actions}>
          <UserMenu />
          <button
            type="button"
            className={styles.menuBtn}
            onClick={onMenuOpen}
            aria-label="Open menu"
          >
            <span className={styles.menuIcon} />
          </button>
        </div>
      </div>
    </header>
  );
}

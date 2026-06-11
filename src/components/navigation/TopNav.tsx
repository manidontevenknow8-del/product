import { Link, useLocation } from 'react-router-dom';
import { PetCluesLogo } from '@/components/brand';
import { UserMenu } from '@/components/user';
import { EDITORIAL_NAV, isNavActive } from '@/routes/navigation';
import { ROUTES } from '@/routes/paths';
import styles from './TopNav.module.css';

type TopNavProps = {
  onMenuOpen?: () => void;
};

function NavLink({ label, path, matchPaths }: (typeof EDITORIAL_NAV)[number]) {
  const location = useLocation();
  const active = isNavActive(location.pathname, { label, path, matchPaths });

  return (
    <Link
      to={path}
      className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}

export function TopNav({ onMenuOpen }: TopNavProps) {
  return (
    <header className="app-shell-nav">
      <div className="app-shell-nav-inner">
        <Link
          to={ROUTES.DASHBOARD}
          className={styles.logo}
          aria-label="PetClues dashboard"
        >
          <PetCluesLogo size="lg" className={styles.logoImg} />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {EDITORIAL_NAV.map((item) => (
            <NavLink key={item.path} {...item} />
          ))}
        </nav>

        <div className={styles.actions}>
          <UserMenu />
          <button
            type="button"
            className={styles.menuBtn}
            onClick={onMenuOpen}
            aria-label="Open menu"
          >
            <span className="sr-only">Open menu</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M2 4.5h14M2 9h14M2 13.5h10"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

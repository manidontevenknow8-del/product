import { Link, useLocation } from 'react-router-dom';
import { PetCluesLogo } from '@/components/brand';
import { Button } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { getPostAuthPath } from '@/auth/postAuthRedirect';
import { ROUTES } from '@/routes/paths';
import styles from './Header.module.css';

const publicNav = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pet guides', href: '#pet-health-guides' },
  { label: 'Blog', path: ROUTES.BLOG },
] as const;

const appNav = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD },
  { label: 'Timeline', path: ROUTES.TIMELINE },
  { label: 'Scan', path: ROUTES.SCAN },
];

type HeaderProps = {
  variant?: 'landing' | 'app';
  /** Transparent bar over full-bleed landing hero */
  overHero?: boolean;
};

export function Header({ variant = 'landing', overHero = false }: HeaderProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const isApp = variant === 'app';

  const showAuthedNav = !isLoading && isAuthenticated && user;

  return (
    <header className={`${styles.header} ${overHero ? styles.headerOverHero : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to={ROUTES.LANDING} className={styles.logo} aria-label="PetClues home">
          <PetCluesLogo size="md" />
        </Link>

        <nav className={styles.nav}>
          {isApp
            ? appNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${styles.navLink} ${
                    location.pathname === item.path ? styles.navLinkActive : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))
            : publicNav.map((item) =>
                'path' in item ? (
                  <Link key={item.path} to={item.path} className={styles.navLink}>
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.href} href={item.href} className={styles.navLink}>
                    {item.label}
                  </a>
                ),
              )}
        </nav>

        <div className={styles.actions}>
          {isApp ? (
            <Link to={ROUTES.PET_PROFILE}>
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </Link>
          ) : showAuthedNav && user ? (
            <>
              <Link to={getPostAuthPath(user, ROUTES.DASHBOARD)}>
                <Button variant="primary" size="sm">
                  {user.needsOnboarding ? 'Continue setup' : 'Open app'}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to={ROUTES.PET_MATCH}>
                <Button variant="ghost" size="sm">
                  Pet match
                </Button>
              </Link>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to={ROUTES.SIGNUP}>
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

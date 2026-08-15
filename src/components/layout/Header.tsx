import { useState, type MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PetCluesLogo } from '@/components/brand';
import { Button } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { getPostAuthPath } from '@/auth/postAuthRedirect';
import { ROUTES } from '@/routes/paths';
import { scrollToLandingSection } from '@/utils/landingSectionScroll';
import { PublicMobileMenu } from '@/components/layout/PublicMobileMenu';
import styles from './Header.module.css';

const publicNav = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Free Clinical Tools', path: ROUTES.TOOLS_VACCINE_SCHEDULER },
  { label: 'Blog', path: ROUTES.BLOG },
  { label: 'About', path: ROUTES.ABOUT },
  { label: 'Pricing', path: ROUTES.PRICING },
] as const;

const appNav = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD },
  { label: 'Timeline', path: ROUTES.TIMELINE },
  { label: 'Scan', path: ROUTES.SCAN },
];

type HeaderProps = {
  variant?: 'landing' | 'app';
};

export function Header({ variant = 'landing' }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const isApp = variant === 'app';
  const isLanding = location.pathname === ROUTES.LANDING;

  const showAuthedNav = !isLoading && isAuthenticated && user;
  const menuItems = isApp ? appNav : publicNav;

  const handleLandingSectionClick =
    (hash: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      if (isLanding) {
        scrollToLandingSection(hash);
        window.history.pushState(null, '', hash);
        return;
      }
      navigate(`${ROUTES.LANDING}${hash}`);
    };

  return (
    <>
      <header
        className={`${styles.header} ${isApp ? styles.headerApp : styles.headerLanding}`}
      >
        <div className={`container ${styles.inner}`}>
          <Link to={ROUTES.LANDING} className={styles.logo} aria-label="PetClues home">
            <PetCluesLogo size="xl" className={styles.logoImg} />
          </Link>

          <nav className={styles.nav} aria-label="Main">
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
                    <a
                      key={item.href}
                      href={`${ROUTES.LANDING}${item.href}`}
                      className={styles.navLink}
                      onClick={handleLandingSectionClick(item.href)}
                    >
                      {item.label}
                    </a>
                  ),
                )}
          </nav>

          <div className={styles.actions}>
            {isApp ? (
              <Link to={ROUTES.PET_PROFILE} className={styles.hideMobile}>
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
            ) : showAuthedNav && user ? (
              <Link to={getPostAuthPath(user, ROUTES.DASHBOARD)}>
                <Button variant="primary" size="sm">
                  {user.needsOnboarding ? 'Continue setup' : 'Open app'}
                </Button>
              </Link>
            ) : (
              <>
                <Link to={ROUTES.PET_MATCH} className={styles.hideMobile}>
                  <Button variant="ghost" size="sm">
                    Pet match
                  </Button>
                </Link>
                <Link to={ROUTES.LOGIN} className={styles.hideMobile}>
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
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
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

      <PublicMobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={menuItems}
        showGuestActions={!isApp && !showAuthedNav}
        authedCta={
          showAuthedNav && user
            ? {
                label: user.needsOnboarding ? 'Continue setup' : 'Open app',
                path: getPostAuthPath(user, ROUTES.DASHBOARD),
              }
            : undefined
        }
      />
    </>
  );
}

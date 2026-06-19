import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { PetCluesLogo } from '@/components/brand';
import { Button } from '@/components/ui';
import { ROUTES } from '@/routes/paths';
import { scrollToLandingSection } from '@/utils/landingSectionScroll';
import styles from './Header.module.css';

const publicNav = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Blog', path: ROUTES.BLOG },
  { label: 'About', path: ROUTES.ABOUT },
  { label: 'Pricing', path: ROUTES.PRICING },
] as const;

/** Landing-only header — no auth/Supabase on first paint. */
export function MarketingHeader() {
  const handleLandingSectionClick =
    (hash: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      scrollToLandingSection(hash);
      window.history.pushState(null, '', hash);
    };

  return (
    <header className={`${styles.header} ${styles.headerLanding}`}>
      <div className={`container ${styles.inner}`}>
        <Link to={ROUTES.LANDING} className={styles.logo} aria-label="PetClues home">
          <PetCluesLogo size="xl" />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {publicNav.map((item) =>
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
        </div>
      </div>
    </header>
  );
}

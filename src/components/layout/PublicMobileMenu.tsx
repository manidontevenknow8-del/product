import { useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { scrollToLandingSection } from '@/utils/landingSectionScroll';
import menuStyles from '@/components/navigation/MobileMenu.module.css';
import styles from './PublicMobileMenu.module.css';

export type PublicNavItem =
  | { label: string; path: string }
  | { label: string; href: string };

type PublicMobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  items: readonly PublicNavItem[];
  showGuestActions?: boolean;
  authedCta?: { label: string; path: string };
};

export function PublicMobileMenu({
  isOpen,
  onClose,
  items,
  showGuestActions = false,
  authedCta,
}: PublicMobileMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === ROUTES.LANDING;

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleHashClick =
    (hash: string) => (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      onClose();
      if (isLanding) {
        scrollToLandingSection(hash);
        window.history.pushState(null, '', hash);
        return;
      }
      navigate(`${ROUTES.LANDING}${hash}`);
    };

  return (
    <>
      <div
        className={menuStyles.backdrop}
        onClick={onClose}
        role="presentation"
        aria-hidden
      />
      <div
        className={menuStyles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={menuStyles.header}>
          <span className={menuStyles.title}>Menu</span>
          <button
            type="button"
            className={menuStyles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className={menuStyles.nav} aria-label="Mobile primary">
          {items.map((item) =>
            'path' in item ? (
              <Link
                key={item.path}
                to={item.path}
                className={`${menuStyles.navLink} ${
                  location.pathname === item.path ? menuStyles.navLinkActive : ''
                }`}
                onClick={onClose}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={`${ROUTES.LANDING}${item.href}`}
                className={menuStyles.navLink}
                onClick={handleHashClick(item.href)}
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className={menuStyles.footer}>
          {authedCta ? (
            <Link to={authedCta.path} className={styles.ctaPrimary} onClick={onClose}>
              {authedCta.label}
            </Link>
          ) : showGuestActions ? (
            <div className={styles.guestActions}>
              <Link to={ROUTES.PET_MATCH} className={menuStyles.footerLink} onClick={onClose}>
                Pet match
              </Link>
              <Link to={ROUTES.LOGIN} className={menuStyles.footerLink} onClick={onClose}>
                Sign in
              </Link>
              <Link to={ROUTES.SIGNUP} className={styles.ctaPrimary} onClick={onClose}>
                Get started
              </Link>
            </div>
          ) : null}
          <p className={menuStyles.footerNote}>PetClues · Premium pet care</p>
        </div>
      </div>
    </>
  );
}

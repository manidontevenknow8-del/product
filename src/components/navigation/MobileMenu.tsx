import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EDITORIAL_NAV, isNavActive } from '@/routes/navigation';
import { ROUTES } from '@/routes/paths';
import styles from './MobileMenu.module.css';

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

function MenuLink({
  item,
  onClose,
}: {
  item: (typeof EDITORIAL_NAV)[number];
  onClose: () => void;
}) {
  const location = useLocation();
  const active = isNavActive(location.pathname, item);

  return (
    <Link
      to={item.path}
      className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
      onClick={onClose}
      aria-current={active ? 'page' : undefined}
    >
      {item.label}
    </Link>
  );
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        role="presentation"
        aria-hidden
      />
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={styles.header}>
          <span className={styles.title}>Menu</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className={styles.nav} aria-label="Mobile primary">
          {EDITORIAL_NAV.map((item) => (
            <MenuLink key={item.path} item={item} onClose={onClose} />
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link to={ROUTES.SETTINGS} className={styles.footerLink} onClick={onClose}>
              Settings
            </Link>
            <Link to={ROUTES.FAMILY_ACCESS} className={styles.footerLink} onClick={onClose}>
              Family Sharing
            </Link>
            <Link to={ROUTES.BILLING} className={styles.footerLink} onClick={onClose}>
              Billing
            </Link>
          </div>
          <p className={styles.footerNote}>PetClues · Premium pet care</p>
        </div>
      </div>
    </>
  );
}

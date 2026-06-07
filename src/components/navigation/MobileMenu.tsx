import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PRIMARY_NAV, SECONDARY_NAV, isNavActive } from '@/routes/navigation';
import styles from './MobileMenu.module.css';

type MobileMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

function MenuLink({
  label,
  path,
  onClose,
}: {
  label: string;
  path: string;
  onClose: () => void;
}) {
  const location = useLocation();
  const active = isNavActive(location.pathname, path);
  const isHash = path.startsWith('#');

  const className = `${styles.link} ${active ? styles.linkActive : ''}`;

  if (isHash) {
    return (
      <a href={path} className={className} onClick={onClose}>
        {label}
      </a>
    );
  }

  return (
    <Link to={path} className={className} onClick={onClose}>
      {label}
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
      <div className={styles.overlay} onClick={onClose} role="presentation" />
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Menu">
        <div className={styles.header}>
          <span className={styles.title}>Menu</span>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <nav className={styles.nav}>
          <span className={styles.sectionLabel}>Main</span>
          {PRIMARY_NAV.map((item) => (
            <MenuLink key={item.path} {...item} onClose={onClose} />
          ))}

          <span className={styles.sectionLabel}>Account</span>
          {SECONDARY_NAV.map((item) => (
            <MenuLink key={item.path} {...item} onClose={onClose} />
          ))}
        </nav>

        <div className={styles.footer}>PetClues · Premium pet care</div>
      </div>
    </>
  );
}

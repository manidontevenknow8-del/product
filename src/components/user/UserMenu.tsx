import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { ROUTES } from '@/routes/paths';
import styles from './UserMenu.module.css';

const PET_AVATAR_PLACEHOLDER =
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=120&h=120&q=80';

type UserMenuProps = {
  avatarUrl?: string | null;
};

export function UserMenu({ avatarUrl }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [open]);

  if (!user) return null;

  const imageSrc = avatarUrl?.trim() || PET_AVATAR_PLACEHOLDER;

  return (
    <div className={`${styles.root} ${open ? styles.rootOpen : ''}`} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <img
          src={imageSrc}
          alt=""
          className={styles.triggerImg}
          referrerPolicy="no-referrer"
        />
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user.name}</p>
            <p className={styles.userEmail}>{user.email}</p>
          </div>

          <Link
            to={ROUTES.SETTINGS}
            className={styles.item}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <Link
            to={ROUTES.FAMILY_ACCESS}
            className={styles.item}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Family Sharing
          </Link>
          <Link
            to={ROUTES.BILLING}
            className={styles.item}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Billing
          </Link>
          <button
            type="button"
            className={`${styles.item} ${styles.itemDanger}`}
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate(ROUTES.LOGIN);
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { ROUTES } from '@/routes/paths';
import styles from './UserMenu.module.css';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
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

  if (!user) return null;

  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <div className={styles.menu} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar initials={initials} size="sm" />
        <span className={styles.name}>{user.name.split(' ')[0]}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.userInfo}>
            <strong>{user.name}</strong>
            <div className={styles.userEmail}>{user.email}</div>
            <span className={styles.planBadge}>
              {isPremium ? 'Premium' : 'Free plan'}
            </span>
            {user.foundingMember && (
              <span className={styles.planBadge}>Founding Member</span>
            )}
          </div>

          <Link to={ROUTES.SETTINGS} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            Settings
          </Link>
          <Link to={ROUTES.BILLING} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
            Billing
          </Link>
          {!isPremium && (
            <Link to={ROUTES.PRICING} className={styles.item} role="menuitem" onClick={() => setOpen(false)}>
              Upgrade to Premium
            </Link>
          )}
          <button
            type="button"
            className={`${styles.item} ${styles.danger}`}
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate(ROUTES.LOGIN);
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

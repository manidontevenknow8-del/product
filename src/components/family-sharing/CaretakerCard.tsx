import { Button } from '@/components/ui';
import { PERMISSION_DEFINITIONS } from '@/data/familySharingData';
import type { Caretaker, SharedPet } from '@/types/familySharing';
import styles from './CaretakerCard.module.css';

type CaretakerCardProps = {
  caretaker: Caretaker;
  sharedPets: SharedPet[];
  onUpdatePermission: (permission: Caretaker['permission']) => void;
  onRemove: () => void;
  onResend?: () => void;
};

export function CaretakerCard({
  caretaker,
  sharedPets,
  onUpdatePermission,
  onRemove,
  onResend,
}: CaretakerCardProps) {
  const initials = caretaker.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const petNames = sharedPets
    .filter((p) => caretaker.sharedPetIds.includes(p.id))
    .map((p) => p.name)
    .join(', ');

  const permissionLabel =
    PERMISSION_DEFINITIONS.find((d) => d.level === caretaker.permission)?.label ??
    caretaker.permission;

  const statusClass =
    caretaker.status === 'active'
      ? styles.statusActive
      : caretaker.status === 'pending'
        ? styles.statusPending
        : styles.statusExpired;

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.person}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <div className={styles.name}>{caretaker.name}</div>
            <div className={styles.email}>{caretaker.email}</div>
          </div>
        </div>
        <span className={`${styles.status} ${statusClass}`}>{caretaker.status}</span>
      </div>

      {petNames && (
        <p className={styles.pets}>Shared pets: {petNames}</p>
      )}

      <div className={styles.meta}>
        <span>
          Permission: <span className={styles.permission}>{permissionLabel}</span>
        </span>
        {caretaker.lastActiveAt && (
          <span>
            Last active{' '}
            {new Date(caretaker.lastActiveAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        {caretaker.permission !== 'owner' && (
          <select
            className={styles.permissionSelect}
            value={caretaker.permission}
            onChange={(e) =>
              onUpdatePermission(e.target.value as Caretaker['permission'])
            }
            aria-label={`Permission for ${caretaker.name}`}
          >
            {PERMISSION_DEFINITIONS.filter((d) => d.level !== 'owner').map((def) => (
              <option key={def.level} value={def.level}>
                {def.label}
              </option>
            ))}
          </select>
        )}
        {caretaker.status === 'pending' && onResend && (
          <Button variant="secondary" size="sm" onClick={onResend}>
            Resend invite
          </Button>
        )}
        {caretaker.permission !== 'owner' && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove access
          </Button>
        )}
      </div>
    </article>
  );
}

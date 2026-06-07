import type { PassportIdentity } from '@/types/passport';
import styles from './PassportHeader.module.css';

type PassportHeaderProps = {
  identity: PassportIdentity;
};

export function PassportHeader({ identity }: PassportHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.avatar}>
        {identity.photo ? (
          <img src={identity.photo} alt={identity.petName} />
        ) : (
          identity.avatarInitials
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.eyebrow}>Emergency Passport · Identity</span>
        <h1 className={styles.name}>{identity.petName}</h1>
        <p className={styles.meta}>
          {identity.breed} · {identity.age}
        </p>
        <dl className={styles.identityFacts}>
          <div className={styles.fact}>
            <dt>Species</dt>
            <dd>{identity.species}</dd>
          </div>
          {identity.gender && (
            <div className={styles.fact}>
              <dt>Gender</dt>
              <dd>{identity.gender}</dd>
            </div>
          )}
          {identity.weight && (
            <div className={styles.fact}>
              <dt>Weight</dt>
              <dd>{identity.weight}</dd>
            </div>
          )}
        </dl>
        <div className={styles.updated}>
          <span className={styles.updatedDot} aria-hidden="true" />
          Last updated {identity.lastUpdated}
        </div>
      </div>
    </header>
  );
}

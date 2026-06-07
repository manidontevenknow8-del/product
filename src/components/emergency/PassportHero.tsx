import { PASSPORT_IMG } from '@/data/passportImages';
import type { PassportIdentity } from '@/services/passport/passportSummaryService';
import styles from './PassportHero.module.css';

type PassportHeroProps = {
  identity: PassportIdentity;
};

export function PassportHero({ identity }: PassportHeroProps) {
  return (
    <header className={styles.hero}>
      <img className={styles.heroBg} src={PASSPORT_IMG.highlight} alt="" aria-hidden />
      <div className={styles.heroScrim} aria-hidden />
      <div className={styles.heroInner}>
        <div className={styles.identity}>
          <div className={styles.avatar}>
            {identity.photo ? (
              <img src={identity.photo} alt="" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitials}>{identity.avatarInitials}</span>
            )}
          </div>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>Emergency passport</span>
            <h1 className={styles.name}>{identity.petName}</h1>
            <p className={styles.meta}>
              {identity.breed} · {identity.age}
              {identity.gender ? ` · ${identity.gender}` : ''}
              {identity.weight ? ` · ${identity.weight}` : ''}
            </p>
            <dl className={styles.facts}>
              <div>
                <dt>Species</dt>
                <dd>{identity.species}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{identity.lastUpdated}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </header>
  );
}

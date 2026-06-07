import type { PassportData } from '@/services/passport/passportSummaryService';
import { PASSPORT_IMG, passportImageUrl } from '@/data/passportImages';
import styles from './PassportHighlightBand.module.css';

type PassportHighlightBandProps = {
  passport: PassportData;
};

export function PassportHighlightBand({ passport }: PassportHighlightBandProps) {
  const { identity } = passport;

  return (
    <section className={styles.hero} aria-labelledby="passport-highlight-title">
      <img
        src={passportImageUrl(PASSPORT_IMG.highlight)}
        alt=""
        className={styles.heroImg}
        aria-hidden
      />

      <div className={styles.identity}>
        <div className={styles.avatar}>
          {identity.photo ? (
            <img src={identity.photo} alt="" className={styles.avatarImg} />
          ) : (
            <span className={styles.avatarInitials}>{identity.avatarInitials}</span>
          )}
        </div>
        <div className={styles.identityCopy}>
          <p className={styles.eyebrow}>Emergency passport</p>
          <h1 id="passport-highlight-title" className={styles.name}>
            {identity.petName}
          </h1>
          <p className={styles.meta}>
            {identity.species} · {identity.breed} · {identity.age}
            {identity.gender ? ` · ${identity.gender}` : ''}
            {identity.weight ? ` · ${identity.weight}` : ''}
          </p>
          <p className={styles.updated}>Last updated {identity.lastUpdated}</p>
        </div>
      </div>
    </section>
  );
}

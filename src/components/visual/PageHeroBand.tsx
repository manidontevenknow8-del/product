import type { ReactNode } from 'react';
import styles from './PageHeroBand.module.css';

type PageHeroBandProps = {
  image: string;
  imageAlt?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  footer?: string;
  avatar?: { src?: string | null; initials?: string };
  actions?: ReactNode;
  compact?: boolean;
};

export function PageHeroBand({
  image,
  imageAlt = '',
  eyebrow,
  title,
  subtitle,
  meta,
  footer,
  avatar,
  actions,
  compact = false,
}: PageHeroBandProps) {
  return (
    <section
      className={`${styles.hero} ${compact ? styles.heroCompact : ''}`}
      aria-labelledby="page-hero-title"
    >
      <img src={image} alt={imageAlt} className={styles.heroImg} aria-hidden={!imageAlt} />
      <div className={styles.scrim} aria-hidden />

      <div className={styles.identity}>
        {avatar && (
          <div className={styles.avatar}>
            {avatar.src ? (
              <img src={avatar.src} alt="" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitials}>{avatar.initials ?? '?'}</span>
            )}
          </div>
        )}
        <div className={styles.copy}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1 id="page-hero-title" className={styles.title}>
            {title}
          </h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {meta && <p className={styles.meta}>{meta}</p>}
          {footer && <p className={styles.footer}>{footer}</p>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </div>
    </section>
  );
}

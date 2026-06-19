import { useEffect, useState, type ReactNode } from 'react';
import { OptimizedImage } from '@/components/ui';
import { normalizePhotoUrlFromDb } from '@/services/pets/petPhotoService';
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
  topActions?: ReactNode;
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
  topActions,
  compact = false,
}: PageHeroBandProps) {
  const avatarSrc = normalizePhotoUrlFromDb(avatar?.src);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarSrc]);

  return (
    <section
      className={`${styles.hero} ${compact ? styles.heroCompact : ''}`}
      aria-labelledby="page-hero-title"
    >
      <OptimizedImage
        src={image}
        alt={imageAlt}
        className={styles.heroImg}
        priority={!compact}
      />
      <div className={styles.scrim} aria-hidden />

      {topActions}

      <div className={styles.identity}>
        {avatar && (
          <div className={styles.avatar}>
            {avatarSrc && !avatarFailed ? (
              <img
                src={avatarSrc}
                alt=""
                className={styles.avatarImg}
                onError={() => setAvatarFailed(true)}
              />
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

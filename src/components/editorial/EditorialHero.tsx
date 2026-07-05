import type { ReactNode } from 'react';

export type EditorialHeroProps = {
  backgroundSrc: string;
  isPetPhoto?: boolean;
  compact?: boolean;
  topSlot?: ReactNode;
  kicker: string;
  title: string;
  meta?: string;
  subtitle?: string;
  portraitSrc?: string | null;
  showPortrait?: boolean;
  children?: ReactNode;
};

export function EditorialHero({
  backgroundSrc,
  isPetPhoto = false,
  compact = false,
  topSlot,
  kicker,
  title,
  meta,
  subtitle,
  portraitSrc,
  showPortrait = false,
  children,
}: EditorialHeroProps) {
  const heroClass = compact ? 'ed-hero ed-hero--compact' : 'ed-hero';

  return (
    <header className={heroClass}>
      <img
        className={`ed-hero__bg ${isPetPhoto ? 'ed-hero__bg--pet' : ''}`}
        src={backgroundSrc}
        alt=""
        aria-hidden
      />
      <div className="ed-hero__wash" aria-hidden />
      <div className="ed-hero__texture" aria-hidden />

      <div className="ed-hero__inner">
        {topSlot && <div className="ed-hero__top">{topSlot}</div>}

        <div className="ed-hero__grid">
          <div className="ed-hero__text">
            <p className="ed-hero__kicker">{kicker}</p>
            <h1 className="ed-hero__title">{title}</h1>
            {meta && <p className="ed-hero__meta">{meta}</p>}
            {subtitle && <p className="ed-hero__subtitle">{subtitle}</p>}
            {children && <div className="ed-hero__cta">{children}</div>}
          </div>

          {showPortrait && portraitSrc && (
            <div className="ed-hero__portrait" aria-hidden>
              <img src={portraitSrc} alt="" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import type { ReactNode } from 'react';
import styles from './CTABlock.module.css';

export type CTABlockVariant = 'trial' | 'reminder' | 'vault' | 'comparison';

export type CTABlockProps = {
  variant: CTABlockVariant;
  headline: string;
  subtext?: string;
  buttonText: string;
  /** Destination for the primary button. Content agents supply the path. */
  href?: string;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

/**
 * Shell only. Copy is passed in by content agents.
 * Variant is available for styling / analytics hooks; no default marketing copy.
 */
export function CTABlock({
  variant,
  headline,
  subtext,
  buttonText,
  href,
  onClick,
  className,
  children,
}: CTABlockProps) {
  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ');

  return (
    <aside className={classes} data-cta-variant={variant}>
      <div className={styles.copy}>
        <h2 className={styles.headline}>{headline}</h2>
        {subtext ? <p className={styles.subtext}>{subtext}</p> : null}
        {children}
      </div>
      {href ? (
        <a className={styles.button} href={href}>
          {buttonText}
        </a>
      ) : (
        <button type="button" className={styles.button} onClick={onClick}>
          {buttonText}
        </button>
      )}
    </aside>
  );
}

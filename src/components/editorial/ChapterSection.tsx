import type { ReactNode } from 'react';
import styles from './ChapterSection.module.css';

export type ChapterSectionProps = {
  chapter?: string;
  title: string;
  lead?: string;
  titleId?: string;
  children: ReactNode;
  bleed?: boolean;
  className?: string;
};

export function ChapterSection({
  chapter,
  title,
  lead,
  titleId,
  children,
  bleed = false,
  className,
}: ChapterSectionProps) {
  return (
    <section
      className={`${styles.section} ${bleed ? styles.bleed : ''} ${className ?? ''}`.trim()}
      data-reveal
    >
      <header className={styles.intro}>
        {chapter && <p className={styles.kicker}>{chapter}</p>}
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {lead && <p className={styles.lead}>{lead}</p>}
      </header>
      {children}
    </section>
  );
}

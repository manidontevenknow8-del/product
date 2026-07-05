import type { CSSProperties } from 'react';
import styles from './KpiStrip.module.css';

export type KpiStripItem = {
  value: string | number;
  label: string;
};

export type KpiStripProps = {
  items: KpiStripItem[];
  note?: string | null;
  variant?: 'default' | 'glass';
  columns?: number;
  'aria-label'?: string;
};

export function KpiStrip({
  items,
  note,
  variant = 'default',
  columns = 4,
  'aria-label': ariaLabel,
}: KpiStripProps) {
  if (variant === 'default') {
    return (
      <section
        className="ed-stats"
        data-reveal
        aria-label={ariaLabel}
        style={{ '--ed-stat-cols': columns } as CSSProperties}
      >
        <div className="ed-stats__inner">
          {items.map((item) => (
            <div key={item.label} className="ed-stat">
              <div className="ed-stat__value">{item.value}</div>
              <div className="ed-stat__label">{item.label}</div>
            </div>
          ))}
        </div>
        {note && (
          <p className={styles.noteDefault} role="note">
            {note}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className={styles.glass} data-reveal aria-label={ariaLabel}>
      <div
        className={styles.glassInner}
        style={{ '--kpi-cols': columns } as CSSProperties}
      >
        {items.map((item) => (
          <div key={item.label} className={styles.cell}>
            <span className={styles.value}>{item.value}</span>
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </div>
      {note && (
        <p className={styles.noteGlass} role="note">
          {note}
        </p>
      )}
    </section>
  );
}

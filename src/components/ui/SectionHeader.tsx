import type { ReactNode } from 'react';
import styles from './SectionHeader.module.css';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
};

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  action,
  align = 'left',
}: SectionHeaderProps) {
  return (
    <div className={`${styles.header} ${styles[align]}`}>
      <div className={styles.content}>
        {eyebrow && <span className="type-caption">{eyebrow}</span>}
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

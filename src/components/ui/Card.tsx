import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: 'default' | 'flat' | 'elevated' | 'highlight' | 'information';
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  className = '',
  ...props
}: CardProps) {
  const classes = [
    styles.card,
    variant !== 'default' ? styles[variant] : '',
    styles[`padding-${padding}`],
    interactive ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

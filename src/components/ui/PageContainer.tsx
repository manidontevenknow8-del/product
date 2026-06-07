import type { ReactNode } from 'react';
import styles from './PageContainer.module.css';

type PageSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type PageContainerProps = {
  children: ReactNode;
  size?: PageSize;
  className?: string;
  animate?: boolean;
};

export function PageContainer({
  children,
  size = 'lg',
  className = '',
  animate = true,
}: PageContainerProps) {
  return (
    <div
      className={`${styles.container} ${styles[size]} ${
        animate ? styles.animate : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

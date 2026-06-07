import type { HTMLAttributes, ReactNode } from 'react';
import styles from './ResponsiveLayoutUtilities.module.css';

type LayoutProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
};

export function Stack({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`${styles.stack} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function StackSm({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`${styles.stackSm} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Grid2({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`${styles.grid2} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function GridAuto({ children, className = '', ...props }: LayoutProps) {
  return (
    <div className={`${styles.gridAuto} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function HideOnMobile({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.hideMobile} ${className}`}>{children}</div>;
}

export function ShowOnMobile({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.hideDesktop} ${className}`}>{children}</div>;
}

export { styles as responsiveStyles };

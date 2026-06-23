import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';

type PublicLayoutProps = {
  children: ReactNode;
  /** Center content in the Picture Pro shell column */
  centered?: boolean;
};

export function PublicLayout({ children, centered = true }: PublicLayoutProps) {
  return (
    <div className="app-root">
      <Header variant="landing" />
      <main className="app-shell-main">
        {centered ? (
          <div className="app-shell-content app-shell-content--flush">{children}</div>
        ) : (
          children
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

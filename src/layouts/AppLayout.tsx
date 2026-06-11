import { useState, type ReactNode } from 'react';
import { TopNav, AppFooter, MobileMenu } from '@/components/navigation';

type AppLayoutProps = {
  children: ReactNode;
  /** Removes main padding for full-bleed pages (e.g. dashboard hero) */
  flushContent?: boolean;
};

export function AppLayout({ children, flushContent = false }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-root">
      <TopNav onMenuOpen={() => setMenuOpen(true)} />

      <main className="app-shell-main">
        <div
          className={[
            'app-shell-content',
            flushContent ? 'app-shell-content--flush' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
      </main>

      <AppFooter />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

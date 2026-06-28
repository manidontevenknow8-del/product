import { useState, type ReactNode } from 'react';
import { TopNav, AppFooter, MobileMenu } from '@/components/navigation';

type AppLayoutProps = {
  children: ReactNode;
  /** Removes main padding for full-bleed pages (e.g. dashboard hero) */
  flushContent?: boolean;
  /** Hides global TopNav + footer (dashboard uses its own editorial chrome) */
  hideChrome?: boolean;
};

export function AppLayout({ children, flushContent = false, hideChrome = false }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-root">
      {!hideChrome ? <TopNav onMenuOpen={() => setMenuOpen(true)} /> : null}

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

      {!hideChrome ? <AppFooter /> : null}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

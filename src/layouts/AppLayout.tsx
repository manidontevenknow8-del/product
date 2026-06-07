import { useState, type ReactNode } from 'react';
import {
  TopNavigation,
  AppSidebar,
  BottomNavigation,
  MobileMenu,
} from '@/components/navigation';
import styles from './AppLayout.module.css';

type AppLayoutProps = {
  children: ReactNode;
  /** Removes main padding for full-bleed pages (e.g. dashboard hero) */
  flushContent?: boolean;
};

export function AppLayout({ children, flushContent = false }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <TopNavigation onMenuOpen={() => setMenuOpen(true)} />
      <div className={styles.body}>
        <AppSidebar />
        <main className={styles.main}>
          <div className={`${styles.content} ${flushContent ? styles.contentFlush : ''}`}>{children}</div>
        </main>
      </div>
      <BottomNavigation />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

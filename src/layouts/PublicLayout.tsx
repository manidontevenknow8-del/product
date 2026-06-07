import type { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

type PublicLayoutProps = {
  children: ReactNode;
};

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Header variant="landing" />
      <main>{children}</main>
      <Footer />
    </>
  );
}

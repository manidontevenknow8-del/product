import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { scrollToLandingSectionWhenReady } from '@/utils/landingSectionScroll';
import {
  HeroSection,
  FeatureHighlights,
  HowItWorks,
  TrustSection,
  LandingBlogPreview,
  LandingExploreSection,
  CTASection,
  Footer,
} from '@/components/landing';
import styles from './LandingPage.module.css';

export function LandingPage({ marketingShell = false }: { marketingShell?: boolean }) {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    scrollToLandingSectionWhenReady(hash);
  }, [hash]);

  return (
    <div className={styles.page}>
      {marketingShell ? <MarketingHeader /> : <Header variant="landing" />}
      <main className={styles.main}>
        <HeroSection />
        <FeatureHighlights />
        <HowItWorks />
        <TrustSection />
        <LandingExploreSection />
        <LandingBlogPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

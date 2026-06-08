import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { scrollToLandingSectionWhenReady } from '@/utils/landingSectionScroll';
import {
  HeroSection,
  FeatureHighlights,
  HowItWorks,
  TrustSection,
  LandingBlogPreview,
  CTASection,
  Footer,
} from '@/components/landing';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    scrollToLandingSectionWhenReady(hash);
  }, [hash]);

  return (
    <div className={styles.page}>
      <Header variant="landing" />
      <main className={styles.main}>
        <HeroSection />
        <FeatureHighlights />
        <HowItWorks />
        <TrustSection />
        <LandingBlogPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

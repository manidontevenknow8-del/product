import { Header } from '@/components/layout/Header';
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
  return (
    <div className={styles.page}>
      <Header variant="landing" overHero />
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

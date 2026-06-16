import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import { HEALTH_DISCLAIMER, LEGAL_CONTACT } from '@/data/legalConfig';
import { ROUTES } from '@/routes/paths';
import { getStaticPageBreadcrumbs } from '@/seo/pageBreadcrumbs';
import styles from './LegalPage.module.css';

type LegalPageLayoutProps = {
  title: string;
  effectiveDate: string;
  eyebrow?: string;
  intro?: ReactNode;
  heroImage?: string;
  children: ReactNode;
  showHealthDisclaimer?: boolean;
};

export function LegalPageLayout({
  title,
  effectiveDate,
  eyebrow = 'Legal',
  intro,
  heroImage = PAGE_IMG.app.trust,
  children,
  showHealthDisclaimer = true,
}: LegalPageLayoutProps) {
  const { pathname } = useLocation();
  const breadcrumbs = getStaticPageBreadcrumbs(pathname);

  return (
    <>
      <Header variant="landing" />
      <div className={styles.page}>
        <PageHeroBand
          compact
          image={heroImage}
          imageAlt=""
          eyebrow={eyebrow}
          title={title}
          meta={effectiveDate ? `Effective date: ${effectiveDate}` : undefined}
        />
        {breadcrumbs.length > 0 && (
          <div className={styles.topBar}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        <div className={styles.topBar}>
          <Link to={ROUTES.LANDING} className={styles.back}>
            ← Back to PetClues
          </Link>
        </div>
        <div className={styles.content}>
          {intro && <div className={styles.intro}>{intro}</div>}
          {children}
          {showHealthDisclaimer && (
            <div className={styles.healthFooter}>
              <p className={styles.healthLine}>{HEALTH_DISCLAIMER}</p>
            </div>
          )}
          <div className={styles.pageFooter}>
            <p className={styles.contactLine}>
              Questions?{' '}
              <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

export function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className={styles.paragraph}>{children}</p>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalSubList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={styles.subBlock}>
      <p className={styles.subTitle}>{title}</p>
      <LegalList items={items} />
    </div>
  );
}

export function LegalContactBlock() {
  return (
    <div className={styles.contactBlock}>
      <p className={styles.contactItem}>
        <span className={styles.contactLabel}>Support</span>
        <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a>
      </p>
    </div>
  );
}

export function LegalComingSoon({ children }: { children: ReactNode }) {
  return <div className={styles.comingSoon}>{children}</div>;
}

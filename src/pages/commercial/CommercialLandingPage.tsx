import { Link, useLocation } from 'react-router-dom';
import { trackCommercialInitiateCheckout, trackCommercialLead } from '@/analytics/commercialTracking';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PageHeroBand } from '@/components/visual/PageHeroBand';
import { Button } from '@/components/ui';
import { TravelDeadlineCalculator } from '@/components/commercial/TravelDeadlineCalculator';
import { DocumentScannerDemo } from '@/components/commercial/DocumentScannerDemo';
import { getCommercialPageByPath } from '@/data/commercial';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { CommercialPageSEO } from '@/seo/commercialSeo';
import { ROUTES } from '@/routes/paths';
import styles from './CommercialLandingPage.module.css';

export function CommercialLandingPage() {
  const { pathname } = useLocation();
  const page = getCommercialPageByPath(pathname);

  if (!page) {
    return (
      <PublicLayout>
        <div className={styles.inner}>
          <h1>Page not found</h1>
          <p>This page does not exist.</p>
          <Link to={ROUTES.LANDING}>
            <Button variant="secondary">Back to home</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const heroActions = (
    <>
      <Link
        to={ROUTES.SIGNUP}
        onClick={() => trackCommercialLead('hero_start_free', pathname)}
      >
        <Button variant="primary">Start free</Button>
      </Link>
      <Link
        to={ROUTES.PRICING}
        onClick={() => trackCommercialInitiateCheckout('hero_view_pricing', pathname)}
      >
        <Button variant="secondary">View pricing</Button>
      </Link>
    </>
  );

  return (
    <PublicLayout>
      <CommercialPageSEO page={page} />

      <PageHeroBand
        image={page.heroImage}
        imageAlt={page.heroImageAlt}
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        subtitle={page.heroSubhead}
        actions={heroActions}
      />

      {pathname === ROUTES.PET_HEALTH_RECORDS && (
        <section className={styles.widgetBand} aria-label="Document scanner demonstration">
          <div className={styles.widgetInner}>
            <div className={styles.widgetContent}>
              <DocumentScannerDemo />
            </div>
          </div>
        </section>
      )}

      {pathname === ROUTES.PET_VACCINATION_RECORDS && (
        <section className={styles.widgetBand} aria-label="Travel deadline calculator">
          <div className={styles.widgetInner}>
            <div className={styles.widgetContent}>
              <TravelDeadlineCalculator />
            </div>
          </div>
        </section>
      )}

      <div className={styles.inner}>
        <section className={styles.section} aria-labelledby="features-heading">
          <h2 id="features-heading" className={styles.sectionTitle}>
            {page.featuresTitle}
          </h2>
          <div className={styles.featureGrid}>
            {page.features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.bodyText}>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.trustSection} aria-labelledby="trust-heading">
          <h2 id="trust-heading" className={styles.sectionTitle}>
            {page.trustTitle}
          </h2>
          <div className={styles.trustGrid}>
            {page.trustPoints.map((point) => (
              <div key={point.title} className={styles.trustCard}>
                <h3 className={styles.cardTitle}>{point.title}</h3>
                <p className={styles.bodyText}>{point.body}</p>
              </div>
            ))}
          </div>
        </section>

        {page.proseSections.map((section) => (
          <section
            key={section.id}
            className={styles.section}
            aria-labelledby={`${section.id}-heading`}
          >
            <h2 id={`${section.id}-heading`} className={styles.sectionTitle}>
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className={styles.bodyText}>
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section className={styles.section} aria-labelledby="faq-heading">
          <h2 id="faq-heading" className={styles.sectionTitle}>
            Frequently asked questions
          </h2>
          <div className={styles.faqList}>
            {page.faqs.map((faq) => (
              <div key={faq.question} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {page.relatedLinks.length > 0 && (
          <section className={styles.section} aria-labelledby="related-heading">
            <h2 id="related-heading" className={styles.sectionTitle}>
              Related guides
            </h2>
            <ul className={styles.linkList}>
              {page.relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.cta} aria-labelledby="commercial-cta-heading">
          <h2 id="commercial-cta-heading">{page.ctaTitle}</h2>
          <p>{page.ctaLead}</p>
          <div className={styles.ctaActions}>
            <Link
              to={ROUTES.SIGNUP}
              onClick={() => trackCommercialLead('cta_create_account', pathname)}
            >
              <Button variant="primary">Create free account</Button>
            </Link>
            <Link to={ROUTES.FOUNDING_MEMBERS}>
              <Button variant="secondary">Founding members</Button>
            </Link>
          </div>
        </section>

        <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
      </div>
    </PublicLayout>
  );
}

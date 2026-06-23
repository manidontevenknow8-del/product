import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Button } from '@/components/ui';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ComparisonTable, RelatedComparisons } from '@/components/compare/ComparisonTable';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { getComparisonBySlug, getRelatedComparisons } from '@/data/comparisons';
import {
  CompareNotFoundSEO,
  ComparePageSEO,
  getComparePageBreadcrumbs,
} from '@/seo/compareSeo';
import { ROUTES } from '@/routes/paths';
import styles from './ComparePage.module.css';

export function ComparePage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getComparisonBySlug(slug) : null;
  const related = page ? getRelatedComparisons(page) : [];

  return (
    <>
      <Header variant="landing" />
      {page && <ComparePageSEO page={page} />}
      {!page && slug && <CompareNotFoundSEO slug={slug} />}

      <div className={styles.comparePage}>
        <div className={styles.inner}>
          {page && <Breadcrumbs items={getComparePageBreadcrumbs(page)} />}

          {!page && (
            <div className={styles.stateWrap}>
              <h1>Comparison not found</h1>
              <p>That comparison page does not exist yet.</p>
              <Link to={ROUTES.COMPARE}>
                <Button variant="secondary">Browse all comparisons</Button>
              </Link>
            </div>
          )}

          {page && (
            <>
              <header className={styles.hero}>
                <span className={styles.eyebrow}>Comparison</span>
                <h1 className={styles.title}>{page.problem.headline}</h1>
                {page.problem.paragraphs[0] && (
                  <p className={styles.lead}>{page.problem.paragraphs[0]}</p>
                )}
              </header>

              <section className={styles.section} aria-labelledby="problem-heading">
                <h2 id="problem-heading" className={styles.sectionTitle}>
                  The problem
                </h2>
                {page.problem.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className={styles.bodyText}>
                    {paragraph}
                  </p>
                ))}
              </section>

              <section className={styles.section} aria-labelledby="comparison-heading">
                <h2 id="comparison-heading" className={styles.sectionTitle}>
                  PetClues vs {page.competitorName}
                </h2>
                <p className={styles.bodyText}>{page.comparisonIntro}</p>
                <ComparisonTable page={page} />
              </section>

              <section className={styles.section} aria-labelledby="pros-cons-heading">
                <h2 id="pros-cons-heading" className={styles.sectionTitle}>
                  Pros and cons
                </h2>
                <div className={styles.prosCons}>
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>{page.competitorName} pros</h3>
                    <ul className={styles.prosList}>
                      {page.competitorPros.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>{page.competitorName} cons</h3>
                    <ul className={styles.consList}>
                      {page.competitorCons.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>PetClues pros</h3>
                    <ul className={styles.prosList}>
                      {page.petcluesPros.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>PetClues cons</h3>
                    <ul className={styles.consList}>
                      {page.petcluesCons.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className={styles.section} aria-labelledby="best-for-heading">
                <h2 id="best-for-heading" className={styles.sectionTitle}>
                  Who is each option for?
                </h2>
                <div className={styles.bestForGrid}>
                  <div className={styles.bestForCard}>
                    <span className={styles.bestForLabel}>Best for {page.competitorShortName}</span>
                    <p className={styles.bodyText}>{page.bestForCompetitor}</p>
                  </div>
                  <div className={styles.bestForCard}>
                    <span className={styles.bestForLabel}>Best for PetClues</span>
                    <p className={styles.bodyText}>{page.bestForPetClues}</p>
                  </div>
                </div>
              </section>

              <section className={styles.section} aria-labelledby="why-heading">
                <h2 id="why-heading" className={styles.sectionTitle}>
                  {page.whyPetCluesExists.headline}
                </h2>
                {page.whyPetCluesExists.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className={styles.bodyText}>
                    {paragraph}
                  </p>
                ))}
              </section>

              <section className={styles.section} aria-labelledby="faq-heading">
                <h2 id="faq-heading" className={styles.sectionTitle}>
                  Frequently asked questions
                </h2>
                <div>
                  {page.faqs.map((faq) => (
                    <div key={faq.question} className={styles.faqItem}>
                      <h3 className={styles.faqQuestion}>{faq.question}</h3>
                      <p className={styles.faqAnswer}>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              {page.relatedBlogSlugs.length > 0 && (
                <section className={styles.section} aria-labelledby="guides-heading">
                  <h2 id="guides-heading" className={styles.sectionTitle}>
                    Related pet health guides
                  </h2>
                  <ul className={styles.blogList}>
                    {page.relatedBlogSlugs.map((blogSlug) => (
                      <li key={blogSlug}>
                        <Link to={`${ROUTES.BLOG}/${blogSlug}`}>
                          Read guide: {blogSlug.replace(/-/g, ' ')}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <RelatedComparisons pages={related} />

              <section className={styles.cta} aria-labelledby="compare-cta-heading">
                <h2 id="compare-cta-heading">Ready to organize your pet&apos;s health records?</h2>
                <p>
                  Start free with PetClues: vaccination reminders, emergency passport, and records
                  for one pet. Upgrade when you need AI vet bill decoding or multiple pets.
                </p>
                <div className={styles.ctaActions}>
                  <Link to={ROUTES.SIGNUP}>
                    <Button variant="primary">Get started free</Button>
                  </Link>
                  <Link to={ROUTES.PRICING}>
                    <Button variant="secondary">View pricing</Button>
                  </Link>
                </div>
              </section>

              <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

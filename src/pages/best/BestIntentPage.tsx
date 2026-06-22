import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Button } from '@/components/ui';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { IntentComparisonTable, RelatedIntentPages } from '@/components/intent/IntentComparisonTable';
import { getComparisonBySlug } from '@/data/comparisons';
import { resolveCompareHref } from '@/data/comparisons/compareRedirects';
import { getFaqItemBySlug } from '@/data/faq';
import { getIntentPageBySlug, getRelatedIntentPages } from '@/data/intent';
import { getLearnArticleBySlug } from '@/data/learn';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import {
  getIntentPageBreadcrumbs,
  IntentNotFoundSEO,
  IntentPageSEO,
} from '@/seo/intentSeo';
import { ROUTES } from '@/routes/paths';
import styles from './BestIntentPage.module.css';

export function BestIntentPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? getIntentPageBySlug(slug) : null;
  const related = page ? getRelatedIntentPages(page) : [];

  return (
    <>
      <Header variant="landing" />
      {page && <IntentPageSEO page={page} />}
      {!page && slug && <IntentNotFoundSEO slug={slug} />}

      <div className={styles.intentPage}>
        <div className={styles.inner}>
          {page && <Breadcrumbs items={getIntentPageBreadcrumbs(page)} />}

          {!page && (
            <div className={styles.stateWrap}>
              <h1>Guide not found</h1>
              <p>That best-of guide does not exist yet.</p>
              <Link to={ROUTES.BEST}>
                <Button variant="secondary">Browse all guides</Button>
              </Link>
            </div>
          )}

          {page && (
            <>
              <header className={styles.hero}>
                <span className={styles.eyebrow}>Best-of guide</span>
                <h1 className={styles.title}>{page.intentLabel}</h1>
                <p className={styles.lead}>{page.quickAnswer}</p>
              </header>

              <section className={styles.section} aria-labelledby="look-for-heading">
                <h2 id="look-for-heading" className={styles.sectionTitle}>
                  What to look for
                </h2>
                <ul className={styles.checkList}>
                  {page.whatToLookFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.section} aria-labelledby="comparison-heading">
                <h2 id="comparison-heading" className={styles.sectionTitle}>
                  How options compare
                </h2>
                <IntentComparisonTable comparisons={page.comparisons} intentLabel={page.intentLabel} />
              </section>

              <section className={styles.section} aria-labelledby="use-cases-heading">
                <h2 id="use-cases-heading" className={styles.sectionTitle}>
                  Common use cases
                </h2>
                <div className={styles.useCaseGrid}>
                  {page.useCases.map((useCase) => (
                    <div key={useCase.title} className={styles.useCaseCard}>
                      <h3 className={styles.cardTitle}>{useCase.title}</h3>
                      <p className={styles.bodyText}>{useCase.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.section} aria-labelledby="petclues-heading">
                <h2 id="petclues-heading" className={styles.sectionTitle}>
                  {page.petcluesPositioning.headline}
                </h2>
                {page.petcluesPositioning.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className={styles.bodyText}>
                    {paragraph}
                  </p>
                ))}
                <ul className={styles.strengthList}>
                  {page.petcluesPositioning.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </section>

              <section className={styles.section} aria-labelledby="citations-heading">
                <h2 id="citations-heading" className={styles.sectionTitle}>
                  Authoritative sources
                </h2>
                <ul className={styles.citationList}>
                  {page.citations.map((citation) => (
                    <li key={citation.url}>
                      <a href={citation.url} target="_blank" rel="noopener noreferrer">
                        {citation.name}
                      </a>
                      <span className={styles.citationContext}> — {citation.context}</span>
                    </li>
                  ))}
                </ul>
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

              {(page.relatedCompareSlugs.length > 0 ||
                page.relatedBlogSlugs.length > 0 ||
                page.relatedLearnSlugs.length > 0 ||
                page.relatedFaqSlugs.length > 0) && (
                <section className={styles.section} aria-labelledby="related-resources-heading">
                  <h2 id="related-resources-heading" className={styles.sectionTitle}>
                    Related resources
                  </h2>
                  <div className={styles.relatedResources}>
                    {page.relatedCompareSlugs.length > 0 && (
                      <div>
                        <h3 className={styles.relatedGroupTitle}>Comparisons</h3>
                        <ul className={styles.linkList}>
                          {page.relatedCompareSlugs.map((compareSlug) => {
                            const comparison = getComparisonBySlug(compareSlug);
                            return (
                              <li key={compareSlug}>
                                <Link to={resolveCompareHref(compareSlug)}>
                                  {comparison?.competitorName
                                    ? `PetClues vs ${comparison.competitorName}`
                                    : compareSlug.replace(/-/g, ' ')}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {page.relatedBlogSlugs.length > 0 && (
                      <div>
                        <h3 className={styles.relatedGroupTitle}>Blog guides</h3>
                        <ul className={styles.linkList}>
                          {page.relatedBlogSlugs.map((blogSlug) => (
                            <li key={blogSlug}>
                              <Link to={`${ROUTES.BLOG}/${blogSlug}`}>
                                {blogSlug.replace(/-/g, ' ')}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {page.relatedLearnSlugs.length > 0 && (
                      <div>
                        <h3 className={styles.relatedGroupTitle}>Learn articles</h3>
                        <ul className={styles.linkList}>
                          {page.relatedLearnSlugs.map((learnSlug) => {
                            const article = getLearnArticleBySlug(learnSlug);
                            return (
                              <li key={learnSlug}>
                                <Link to={`${ROUTES.LEARN}/${learnSlug}`}>
                                  {article?.title ?? learnSlug.replace(/-/g, ' ')}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {page.relatedFaqSlugs.length > 0 && (
                      <div>
                        <h3 className={styles.relatedGroupTitle}>FAQ</h3>
                        <ul className={styles.linkList}>
                          {page.relatedFaqSlugs.map((faqSlug) => {
                            const faq = getFaqItemBySlug(faqSlug);
                            return (
                              <li key={faqSlug}>
                                <Link to={`${ROUTES.FAQ}/${faqSlug}`}>
                                  {faq?.question ?? faqSlug.replace(/-/g, ' ')}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <RelatedIntentPages pages={related} />

              <section className={styles.cta} aria-labelledby="intent-cta-heading">
                <h2 id="intent-cta-heading">Ready to organize your pet&apos;s health records?</h2>
                <p>
                  Start free with PetClues — vaccination reminders, emergency passport, and records
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

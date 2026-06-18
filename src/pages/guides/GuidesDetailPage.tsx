import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Button } from '@/components/ui';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ChecklistGroups } from '@/components/programmatic/ChecklistGroups';
import { VaccinationScheduleTable } from '@/components/programmatic/VaccinationScheduleTable';
import { getProgrammaticCollection } from '@/data/programmatic/collections';
import {
  getProgrammaticPage,
  getRelatedProgrammaticPages,
  isProgrammaticCollectionId,
} from '@/data/programmatic';
import { getFaqItemBySlug } from '@/data/faq';
import { getLearnArticleBySlug } from '@/data/learn';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import {
  ProgrammaticNotFoundSEO,
  ProgrammaticPageSEO,
  getProgrammaticPageBreadcrumbs,
} from '@/seo/programmaticSeo';
import { ROUTES } from '@/routes/paths';
import styles from './GuidesPages.module.css';
import relatedStyles from '@/components/programmatic/ProgrammaticSections.module.css';

export function GuidesDetailPage() {
  const { collection, slug } = useParams<{ collection: string; slug: string }>();
  const validCollection = collection && isProgrammaticCollectionId(collection) ? collection : null;
  const page = validCollection && slug ? getProgrammaticPage(validCollection, slug) : null;
  const related = page ? getRelatedProgrammaticPages(page) : [];
  const collectionMeta = validCollection ? getProgrammaticCollection(validCollection) : null;

  return (
    <>
      <Header variant="landing" />
      {page && <ProgrammaticPageSEO page={page} />}
      {!page && <ProgrammaticNotFoundSEO collectionId={collection} slug={slug} />}

      <div className={styles.page}>
        <div className={styles.inner}>
          {page && <Breadcrumbs items={getProgrammaticPageBreadcrumbs(page)} />}

          {!page && (
            <div className={styles.stateWrap}>
              <h1>Guide not found</h1>
              <p>This programmatic guide does not exist yet.</p>
              <Link to={ROUTES.GUIDES}>
                <Button variant="secondary">Browse all guides</Button>
              </Link>
            </div>
          )}

          {page && collectionMeta && (
            <article>
              <header className={styles.hero}>
                <span className={styles.eyebrow}>{collectionMeta.label}</span>
                <h1 className={styles.title}>{page.title.replace(' | PetClues Guides', '')}</h1>
                <p className={styles.lead}>{page.quickAnswer}</p>
                <div className={styles.meta}>
                  <time dateTime={page.updatedAt}>
                    Updated{' '}
                    {new Date(page.updatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </header>

              {page.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className={styles.bodyText}>
                  {paragraph}
                </p>
              ))}

              {page.schedule && page.schedule.length > 0 && (
                <section className={styles.section} aria-labelledby="schedule-heading">
                  <h2 id="schedule-heading" className={styles.sectionTitle}>
                    Vaccination schedule
                  </h2>
                  <VaccinationScheduleTable rows={page.schedule} />
                </section>
              )}

              {page.sections.map((section) => (
                <section
                  key={section.heading}
                  className={styles.section}
                  aria-labelledby={section.heading.replace(/\s+/g, '-')}
                >
                  <h2 id={section.heading.replace(/\s+/g, '-')} className={styles.sectionTitle}>
                    {section.heading}
                  </h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)} className={styles.bodyText}>
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className={styles.bulletList}>
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}

              {page.checklist && page.checklist.length > 0 && (
                <section className={styles.section} aria-labelledby="checklist-heading">
                  <h2 id="checklist-heading" className={styles.sectionTitle}>
                    Checklist
                  </h2>
                  <ChecklistGroups groups={page.checklist} />
                </section>
              )}

              <section className={styles.section} aria-labelledby="workflow-heading">
                <h2 id="workflow-heading" className={styles.sectionTitle}>
                  {page.petcluesWorkflow.headline}
                </h2>
                <ol className={styles.stepsList}>
                  {page.petcluesWorkflow.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
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

              {(page.relatedLearnSlugs.length > 0 ||
                page.relatedBlogSlugs.length > 0 ||
                page.relatedFaqSlugs.length > 0) && (
                <section className={styles.section} aria-labelledby="resources-heading">
                  <h2 id="resources-heading" className={styles.sectionTitle}>
                    Related resources
                  </h2>
                  <div className={styles.resourceGrid}>
                    {page.relatedLearnSlugs.length > 0 && (
                      <div>
                        <h3 className={styles.resourceTitle}>Learn</h3>
                        <ul className={styles.bulletList}>
                          {page.relatedLearnSlugs.map((learnSlug) => {
                            const article = getLearnArticleBySlug(learnSlug);
                            return (
                              <li key={learnSlug}>
                                <Link to={`${ROUTES.LEARN}/${learnSlug}`}>
                                  {article?.title.replace(' | PetClues Learn', '') ??
                                    learnSlug.replace(/-/g, ' ')}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {page.relatedBlogSlugs.length > 0 && (
                      <div>
                        <h3 className={styles.resourceTitle}>Blog</h3>
                        <ul className={styles.bulletList}>
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
                    {page.relatedFaqSlugs.length > 0 && (
                      <div>
                        <h3 className={styles.resourceTitle}>FAQ</h3>
                        <ul className={styles.bulletList}>
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

              {related.length > 0 && (
                <section className={relatedStyles.related} aria-labelledby="related-guides-heading">
                  <h2 id="related-guides-heading" className={relatedStyles.relatedTitle}>
                    Related guides
                  </h2>
                  <ul className={relatedStyles.relatedList}>
                    {related.map((item) => (
                      <li key={`${item.collectionId}-${item.slug}`}>
                        <Link
                          to={`${ROUTES.GUIDES}/${item.collectionId}/${item.slug}`}
                          className={relatedStyles.relatedLink}
                        >
                          {item.subjectName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className={styles.cta} aria-labelledby="guides-cta-heading">
                <h2 id="guides-cta-heading">Track this guide in PetClues</h2>
                <p>
                  Turn schedules and checklists into reminders, documents, and an emergency passport
                  — free for one pet.
                </p>
                <div className={styles.ctaActions}>
                  <Link to={ROUTES.SIGNUP}>
                    <Button variant="primary">Get started free</Button>
                  </Link>
                  <Link to={`${ROUTES.GUIDES}/${page.collectionId}`}>
                    <Button variant="secondary">More {collectionMeta.label.toLowerCase()}</Button>
                  </Link>
                </div>
              </section>

              <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
            </article>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

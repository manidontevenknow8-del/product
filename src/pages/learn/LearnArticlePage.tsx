import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Button, Badge } from '@/components/ui';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { RelatedLearnArticles } from '@/components/learn/RelatedLearnArticles';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { getLearnArticleBySlug, getRelatedLearnArticles } from '@/data/learn';
import { getLearnCategoryLabel } from '@/data/learn/categories';
import {
  LearnArticleNotFoundSEO,
  LearnArticleSEO,
  getLearnArticleBreadcrumbs,
} from '@/seo/learnSeo';
import { ROUTES } from '@/routes/paths';
import styles from './LearnArticlePage.module.css';

export function LearnArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getLearnArticleBySlug(slug) : null;
  const related = article ? getRelatedLearnArticles(article) : [];

  return (
    <>
      <Header variant="landing" />
      {article && <LearnArticleSEO article={article} />}
      {!article && slug && <LearnArticleNotFoundSEO slug={slug} />}

      <div className={styles.learnPage}>
        <div className={styles.inner}>
          {article && <Breadcrumbs items={getLearnArticleBreadcrumbs(article)} />}

          {!article && (
            <div className={styles.stateWrap}>
              <h1>Article not found</h1>
              <p>This knowledge base article does not exist yet.</p>
              <Link to={ROUTES.LEARN}>
                <Button variant="secondary">Browse all guides</Button>
              </Link>
            </div>
          )}

          {article && (
            <article>
              <header className={styles.hero}>
                <Badge variant="dark">{getLearnCategoryLabel(article.categoryId)}</Badge>
                <h1 className={styles.title}>
                  {article.title.replace(' | PetClues Learn', '')}
                </h1>
                <p className={styles.lead}>{article.excerpt}</p>
                <div className={styles.meta}>
                  <span>{article.readMinutes} min read</span>
                  <time dateTime={article.updatedAt}>
                    Updated{' '}
                    {new Date(article.updatedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </header>

              <section className={styles.section} aria-labelledby="what-heading">
                <h2 id="what-heading" className={styles.sectionTitle}>
                  {article.what.headline}
                </h2>
                {article.what.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className={styles.bodyText}>
                    {paragraph}
                  </p>
                ))}
              </section>

              <section className={styles.section} aria-labelledby="why-heading">
                <h2 id="why-heading" className={styles.sectionTitle}>
                  {article.why.headline}
                </h2>
                {article.why.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className={styles.bodyText}>
                    {paragraph}
                  </p>
                ))}
              </section>

              <section className={styles.section} aria-labelledby="how-heading">
                <h2 id="how-heading" className={styles.sectionTitle}>
                  {article.how.headline}
                </h2>
                <ol className={styles.orderedList}>
                  {article.how.steps.map((step) => (
                    <li key={step.slice(0, 40)}>{step}</li>
                  ))}
                </ol>
              </section>

              <section className={styles.section} aria-labelledby="practices-heading">
                <h2 id="practices-heading" className={styles.sectionTitle}>
                  Best practices
                </h2>
                <div className={styles.twoCol}>
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Do this</h3>
                    <ul className={styles.list}>
                      {article.bestPractices.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Common mistakes</h3>
                    <ul className={styles.list}>
                      {article.commonMistakes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className={styles.section} aria-labelledby="workflow-heading">
                <div className={styles.workflow}>
                  <h2 id="workflow-heading" className={styles.sectionTitle}>
                    {article.petcluesWorkflow.headline}
                  </h2>
                  {article.petcluesWorkflow.paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className={styles.bodyText}>
                      {paragraph}
                    </p>
                  ))}
                  <ol className={styles.orderedList}>
                    {article.petcluesWorkflow.steps.map((step) => (
                      <li key={step.slice(0, 40)}>{step}</li>
                    ))}
                  </ol>
                </div>
              </section>

              <section className={styles.section} aria-labelledby="faq-heading">
                <h2 id="faq-heading" className={styles.sectionTitle}>
                  Frequently asked questions
                </h2>
                {article.faqs.map((faq) => (
                  <div key={faq.question} className={styles.faqItem}>
                    <h3 className={styles.faqQuestion}>{faq.question}</h3>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </div>
                ))}
              </section>

              {(article.relatedBlogSlugs.length > 0 ||
                article.relatedCompareSlugs.length > 0) && (
                <div className={styles.linksSection}>
                  {article.relatedBlogSlugs.length > 0 && (
                    <>
                      <h2 className={styles.linksTitle}>Related blog guides</h2>
                      <ul className={styles.linkList}>
                        {article.relatedBlogSlugs.map((blogSlug) => (
                          <li key={blogSlug}>
                            <Link to={`${ROUTES.BLOG}/${blogSlug}`}>
                              {blogSlug.replace(/-/g, ' ')}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {article.relatedCompareSlugs.length > 0 && (
                    <>
                      <h2 className={styles.linksTitle}>Related comparisons</h2>
                      <ul className={styles.linkList}>
                        {article.relatedCompareSlugs.map((compareSlug) => (
                          <li key={compareSlug}>
                            <Link to={`${ROUTES.COMPARE}/${compareSlug}`}>
                              {compareSlug.replace(/-/g, ' ')}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}

              <RelatedLearnArticles articles={related} />

              <section className={styles.cta} aria-labelledby="learn-cta-heading">
                <h2 id="learn-cta-heading">Put this guide into practice</h2>
                <p>
                  Start free with PetClues — organize records, set reminders, and build your
                  pet&apos;s emergency passport in one calm app.
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
            </article>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

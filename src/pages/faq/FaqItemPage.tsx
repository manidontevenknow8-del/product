import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Button, Badge } from '@/components/ui';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { BlogPostBody } from '@/components/blog/BlogPostBody';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { getFaqCategoryLabel } from '@/data/faq/categories';
import { getFaqItemBySlug, getRelatedFaqItems } from '@/data/faq';
import { FaqItemSEO, getFaqIndexBreadcrumbs } from '@/seo/faqHubSeo';
import { ROUTES } from '@/routes/paths';
import styles from './FaqItemPage.module.css';

export function FaqItemPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? getFaqItemBySlug(slug) : null;
  const related = item ? getRelatedFaqItems(item) : [];

  const breadcrumbs = item
    ? [
        ...getFaqIndexBreadcrumbs(),
        {
          name: getFaqCategoryLabel(item.categoryId),
          path: `${ROUTES.FAQ}?category=${item.categoryId}`,
        },
        { name: item.question, path: `${ROUTES.FAQ}/${item.slug}` },
      ]
    : getFaqIndexBreadcrumbs();

  return (
    <>
      <Header variant="landing" />
      {item && <FaqItemSEO item={item} />}

      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs items={breadcrumbs} />

          {!item && (
            <div className={styles.stateWrap}>
              <h1>Question not found</h1>
              <p>This FAQ entry does not exist yet.</p>
              <Link to={ROUTES.FAQ}>
                <Button variant="secondary">Browse all FAQs</Button>
              </Link>
            </div>
          )}

          {item && (
            <article>
              <header className={styles.hero}>
                <Badge variant="dark">{getFaqCategoryLabel(item.categoryId)}</Badge>
                <h1 className={styles.title}>{item.question}</h1>
                <p className={styles.lead}>{item.shortAnswer}</p>
              </header>

              <div className={styles.prose}>
                <BlogPostBody content={item.answer} />
              </div>

              {item.relatedBlogSlugs.length > 0 && (
                <section className={styles.related}>
                  <h2 className={styles.relatedTitle}>Related guides</h2>
                  <ul className={styles.relatedList}>
                    {item.relatedBlogSlugs.map((blogSlug) => (
                      <li key={blogSlug}>
                        <Link to={`${ROUTES.BLOG}/${blogSlug}`}>{blogSlug.replace(/-/g, ' ')}</Link>
                      </li>
                    ))}
                    {item.relatedLearnSlugs.map((learnSlug) => (
                      <li key={learnSlug}>
                        <Link to={`${ROUTES.LEARN}/${learnSlug}`}>{learnSlug.replace(/-/g, ' ')}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {related.length > 0 && (
                <section className={styles.related}>
                  <h2 className={styles.relatedTitle}>Related questions</h2>
                  <ul className={styles.relatedList}>
                    {related.map((relatedItem) => (
                      <li key={relatedItem.slug}>
                        <Link to={`${ROUTES.FAQ}/${relatedItem.slug}`}>{relatedItem.question}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <footer className={styles.footer}>
                <p>Put pet health organization on autopilot with PetClues records and reminders.</p>
                <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
                <Link to={ROUTES.SIGNUP}>
                  <Button variant="primary">Start free</Button>
                </Link>
              </footer>
            </article>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

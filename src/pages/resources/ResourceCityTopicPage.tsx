import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ClinicalFaqAccordion } from '@/components/seo/ClinicalFaqAccordion';
import { Button } from '@/components/ui';
import {
  getResourceEntry,
  listNearbyCityPages,
  listTopicsForCity,
} from '@/data/resourceMatrix';
import { getResourcePageContent } from '@/data/resourceContent';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { ROUTES } from '@/routes/paths';
import { SITE_META } from '@/data/seoConfig';
import { ResourceGuideSEO, getResourceGuideBreadcrumbs } from '@/seo/resourceSeo';
import styles from '@/pages/guides/lifecycle/LifecycleGuidePage.module.css';

export function ResourceCityTopicPage() {
  const params = useParams<{ city?: string; topic?: string }>();
  const entry = getResourceEntry(params.city, params.topic);

  if (!entry) {
    return (
      <>
        <Header variant="landing" />
        <div className={styles.page}>
          <div className={styles.inner}>
            <div className={styles.stateWrap}>
              <h1>Resource not found</h1>
              <p>This city packet is not in the PetClues resource matrix yet.</p>
              <Link to="/resources">
                <Button variant="secondary">Browse local resources</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const content = getResourcePageContent(entry);
  const relatedTopics = listTopicsForCity(entry.city.slug, entry.topic.slug);
  const nearby = listNearbyCityPages(entry, 8);
  const pageUrl = `${SITE_META.siteUrl}${entry.path}`;

  return (
    <>
      <ResourceGuideSEO entry={entry} />
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs items={getResourceGuideBreadcrumbs(entry)} />

          <header className={styles.hero}>
            <p className={styles.eyebrow}>
              {entry.topic.kicker}
              <span className={styles.kickerChip}>{entry.city.stateAbbr}</span>
            </p>
            <h1 className={styles.title}>{content.title}</h1>
            <p className={styles.lead}>{content.lead}</p>
            <figure className={styles.heroMedia}>
              <img
                className={styles.heroImage}
                src={content.heroImage}
                alt=""
                width={1200}
                height={675}
                loading="eager"
                decoding="async"
              />
            </figure>
          </header>

          <section className={styles.chapter}>
            <p className={styles.chapterKicker}>Local intake</p>
            <h2 className={styles.chapterTitle}>What {entry.city.name} desks actually ask for</h2>
            <p className={styles.body}>{content.overview}</p>
            <p className={styles.body}>{content.localNote}</p>
            {content.uniqueParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </section>

          <section className={styles.chapter}>
            <p className={styles.chapterKicker}>Packet checklist</p>
            <h2 className={styles.chapterTitle}>Documents to have on your phone</h2>
            <ul className={styles.checklist}>
              {content.checklist.map((item) => (
                <li key={item}>
                  <span className={styles.checklistItem}>
                    <span className={styles.checkCopy}>
                      <span className={styles.checkLabel}>{item}</span>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.chapter}>
            <p className={styles.chapterKicker}>How to run it</p>
            <h2 className={styles.chapterTitle}>Three steps before drop-off</h2>
            <ol className={styles.timeline}>
              {content.steps.map((step) => (
                <li key={step.title} className={styles.timelineItem}>
                  <h3 className={styles.timeTitle}>{step.title}</h3>
                  <p className={styles.timeDetail}>{step.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          <aside className={styles.cta}>
            <h2 className={styles.ctaTitle}>{content.ctaTitle}</h2>
            <p className={styles.ctaBody}>{content.ctaBody}</p>
            <div className={styles.ctaActions}>
              <Link className={styles.ctaPrimary} to={ROUTES.PET_VACCINATION_RECORDS}>
                Pet vaccination records
              </Link>
              <Link className={styles.ctaSecondary} to={ROUTES.DIGITAL_PET_PASSPORT}>
                Digital pet passport
              </Link>
              <Link className={styles.ctaSecondary} to={ROUTES.SIGNUP}>
                Start free
              </Link>
            </div>
          </aside>

          <ClinicalFaqAccordion faqs={content.faqs} pageUrl={pageUrl} heading={`${entry.topic.label} in ${entry.city.name}`} />

          <section className={styles.loop}>
            <h2 className={styles.loopTitle}>Editorial guides this {entry.city.name} packet uses</h2>
            <p className={styles.loopLead}>
              Unique local copy on this URL, plus the existing PetClues blogs that already rank for
              the underlying records problems.
            </p>
            <div className={styles.loopGrid}>
              {content.library.map((link) => (
                <Link key={link.href} className={styles.loopLink} to={link.href}>
                  <span className={styles.loopLinkLabel}>{link.label}</span>
                  <span className={styles.loopMeta}>Blog</span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.loop}>
            <h2 className={styles.loopTitle}>More {entry.city.name} record packets</h2>
            <p className={styles.loopLead}>
              Stay in this metro cluster. Every packet is a lead-gen page that still needs a vault.
            </p>
            <div className={styles.loopGrid}>
              {relatedTopics.map((related) => (
                <Link key={related.path} className={styles.loopLink} to={related.path}>
                  <span className={styles.loopLinkLabel}>{related.topic.label}</span>
                  <span className={styles.loopMeta}>{related.topic.kicker}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.loop}>
            <h2 className={styles.loopTitle}>Same packet in nearby metros</h2>
            <div className={styles.loopGrid}>
              {nearby.map((related) => (
                <Link key={related.path} className={styles.loopLink} to={related.path}>
                  <span className={styles.loopLinkLabel}>
                    {related.topic.label} in {related.city.name}
                  </span>
                  <span className={styles.loopMeta}>{related.city.stateAbbr}</span>
                </Link>
              ))}
            </div>
          </section>

          <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

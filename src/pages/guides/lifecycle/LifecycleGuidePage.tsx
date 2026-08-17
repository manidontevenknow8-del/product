import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { ClinicalFaqAccordion } from '@/components/seo/ClinicalFaqAccordion';
import { Button } from '@/components/ui';
import { getLifecycleEntry, listRelatedLifecycleStages } from '@/data/lifecycleMatrix';
import { getLifecyclePageContent } from '@/data/lifecycleContent';
import { listPagerankMedicalGuides, toMedicalGuideLink } from '@/data/lifecycleMedicalLinks';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { ROUTES } from '@/routes/paths';
import { SITE_META } from '@/data/seoConfig';
import { LifecycleGuideSEO, getLifecycleGuideBreadcrumbs } from '@/seo/lifecycleSeo';
import styles from './LifecycleGuidePage.module.css';

function LifecycleGuideNotFound() {
  return (
    <>
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.stateWrap}>
            <h1>Guide not found</h1>
            <p>This breed lifecycle guide is not in the PetClues matrix yet.</p>
            <Link to={ROUTES.GUIDES}>
              <Button variant="secondary">Back to health guides</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export function LifecycleGuidePage() {
  const params = useParams<{ breed?: string; stage?: string }>();
  const entry = getLifecycleEntry(params.breed, params.stage);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const content = useMemo(() => (entry ? getLifecyclePageContent(entry) : null), [entry]);
  const medicalLinks = useMemo(
    () => (entry ? listPagerankMedicalGuides(entry.breed).map(toMedicalGuideLink) : []),
    [entry],
  );
  const relatedStages = useMemo(
    () => (entry ? listRelatedLifecycleStages(entry.breed.slug, entry.stage.slug) : []),
    [entry],
  );

  if (!entry || !content) return <LifecycleGuideNotFound />;

  const pageUrl = `${SITE_META.siteUrl}${entry.path}`;
  const checkedCount = content.checklist.filter((item) => checked[item.id]).length;
  const progressPct = content.checklist.length
    ? Math.round((checkedCount / content.checklist.length) * 100)
    : 0;

  return (
    <>
      <LifecycleGuideSEO entry={entry} />
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs items={getLifecycleGuideBreadcrumbs(entry)} />

          <header className={styles.hero}>
            <p className={styles.eyebrow}>
              {entry.stage.kicker}
              <span className={styles.kickerChip}>{entry.breed.size} breed</span>
            </p>
            <h1 className={styles.title}>{content.title}</h1>
            <p className={styles.lead}>{content.lead}</p>
            <ul className={styles.metaRow}>
              <li>
                Adult weight <span>{entry.breed.adultWeight}</span>
              </li>
              <li>
                Typical lifespan <span>{entry.breed.lifespanYears} years</span>
              </li>
              <li>
                Watch list <span>{entry.breed.healthFocus}</span>
              </li>
            </ul>
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

          <section className={styles.chapter} aria-labelledby="overview-heading">
            <p className={styles.chapterKicker}>Clinical context</p>
            <h2 id="overview-heading" className={styles.chapterTitle}>
              Why this stage is different for {entry.breed.name}s
            </h2>
            <p className={styles.body}>{content.overview}</p>
          </section>

          <section className={styles.chapter} aria-labelledby="checklist-heading">
            <p className={styles.chapterKicker}>Interactive watch list</p>
            <h2 id="checklist-heading" className={styles.chapterTitle}>
              {content.checklistHeading}
            </h2>
            <div className={styles.progress}>
              {checkedCount} of {content.checklist.length} checked
              <div className={styles.progressTrack} aria-hidden="true">
                <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <ul className={styles.checklist}>
              {content.checklist.map((item) => (
                <li key={item.id}>
                  <label className={styles.checklistItem} data-checked={checked[item.id] ? 'true' : 'false'}>
                    <input
                      className={styles.checkbox}
                      type="checkbox"
                      checked={Boolean(checked[item.id])}
                      onChange={() =>
                        setChecked((current) => ({ ...current, [item.id]: !current[item.id] }))
                      }
                    />
                    <span className={styles.checkCopy}>
                      <span className={styles.checkLabel}>{item.label}</span>
                      <span className={styles.urgency} data-level={item.urgency}>
                        {item.urgency}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.chapter} aria-labelledby="timeline-heading">
            <p className={styles.chapterKicker}>Dated protocol</p>
            <h2 id="timeline-heading" className={styles.chapterTitle}>
              {content.timelineHeading}
            </h2>
            <ol className={styles.timeline}>
              {content.timeline.map((step) => (
                <li key={`${step.label}-${step.title}`} className={styles.timelineItem}>
                  <p className={styles.timeLabel}>{step.label}</p>
                  <h3 className={styles.timeTitle}>{step.title}</h3>
                  <p className={styles.timeDetail}>{step.detail}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.chapter}>
            <p className={styles.chapterKicker}>Breed-specific briefing</p>
            <h2 className={styles.chapterTitle}>
              Why this {entry.breed.name} page is not a copied template
            </h2>
            {content.uniqueParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </section>

          <section className={styles.chapter} aria-labelledby="protocol-heading">
            <p className={styles.chapterKicker}>Digital vault</p>
            <h2 id="protocol-heading" className={styles.chapterTitle}>
              {content.protocolHeading}
            </h2>
            <ol className={styles.protocol}>
              {content.protocol.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className={styles.chapter} aria-labelledby="diet-heading">
            <p className={styles.chapterKicker}>Bowl notes</p>
            <h2 id="diet-heading" className={styles.chapterTitle}>
              {content.dietHeading}
            </h2>
            <div className={styles.dietGrid}>
              {content.dietNotes.map((note) => (
                <p key={note} className={styles.dietCard}>
                  {note}
                </p>
              ))}
            </div>
          </section>

          <aside className={styles.cta} aria-labelledby="lifecycle-cta-heading">
            <h2 id="lifecycle-cta-heading" className={styles.ctaTitle}>
              Keep this {entry.breed.name} timeline in one vault
            </h2>
            <p className={styles.ctaBody}>
              $249 lifetime Genesis allocation - white-glove digitization of vaccine certificates,
              diet trials, imaging, and {entry.stage.label.toLowerCase()} notes so every specialist
              and sitter reads the same dossier.
            </p>
            <div className={styles.ctaActions}>
              <Link className={styles.ctaPrimary} to={ROUTES.GENESIS}>
                Secure Genesis Vault
              </Link>
              <Link className={styles.ctaSecondary} to={ROUTES.SIGNUP}>
                Start a free sandbox
              </Link>
            </div>
          </aside>

          <ClinicalFaqAccordion
            faqs={content.faqs}
            pageUrl={pageUrl}
            heading={`${entry.stage.label} for ${entry.breed.name}s - common questions`}
          />

          <section className={styles.loop} aria-labelledby="library-heading">
            <p className={styles.chapterKicker}>From the PetClues library</p>
            <h2 id="library-heading" className={styles.loopTitle}>
              Editorial guides this {entry.breed.name} page is built on
            </h2>
            <p className={styles.loopLead}>
              These are the existing long-form blogs, not cloned matrix text. Read them, then come
              back to this {entry.stage.label.toLowerCase()} checklist.
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

          <section className={styles.loop} aria-labelledby="medical-loop-heading">
            <p className={styles.chapterKicker}>Internal PageRank loop</p>
            <h2 id="medical-loop-heading" className={styles.loopTitle}>
              More {entry.breed.name} Health Guides
            </h2>
            <p className={styles.loopLead}>
              Cross-link into the clinical breed-condition library so this lifecycle URL passes
              equity to the medical matrix - and so owners can move from diet timing to disease
              surveillance without a dead end.
            </p>
            <div className={styles.loopGrid}>
              {medicalLinks.map((link) => (
                <Link key={link.href} className={styles.loopLink} to={link.href}>
                  <span className={styles.loopLinkLabel}>{link.label}</span>
                  <span className={styles.loopMeta}>{link.riskLevel} risk</span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.loop} aria-labelledby="stage-loop-heading">
            <h2 id="stage-loop-heading" className={styles.loopTitle}>
              Related Lifecycle Stages
            </h2>
            <p className={styles.loopLead}>
              The other {relatedStages.length} lifecycle and diet briefs for {entry.breed.name}s -
              stay inside this breed cluster instead of bouncing to a generic feeding article.
            </p>
            <div className={styles.loopGrid}>
              {relatedStages.map((related) => (
                <Link key={related.path} className={styles.loopLink} to={related.path}>
                  <span className={styles.loopLinkLabel}>{related.stage.label}</span>
                  <span className={styles.loopMeta}>{related.stage.kicker}</span>
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { listProgrammaticCollections } from '@/data/programmatic/collections';
import { FeaturedBlogLinks } from '@/components/seo/FeaturedBlogLinks';
import { listProgrammaticPages, PROGRAMMATIC_PAGE_COUNT } from '@/data/programmatic';
import { listBreedConditions, getBreedConditionPath } from '@/data/breedConditions';
import { ProgrammaticHubSEO, getProgrammaticHubBreadcrumbs } from '@/seo/programmaticSeo';
import { ROUTES } from '@/routes/paths';
import styles from './GuidesPages.module.css';

export function GuidesHubPage() {
  const collections = listProgrammaticCollections();
  const collectionStats = collections.map((collection) => ({
    id: collection.id,
    label: collection.label,
    pageCount: listProgrammaticPages(collection.id).length,
  }));
  const breedConditions = listBreedConditions();
  const BREED_PREVIEW_COUNT = 24;
  const [breedsExpanded, setBreedsExpanded] = useState(false);
  const hasMoreBreeds = breedConditions.length > BREED_PREVIEW_COUNT;
  const visibleBreedConditions =
    breedsExpanded || !hasMoreBreeds
      ? breedConditions
      : breedConditions.slice(0, BREED_PREVIEW_COUNT);

  return (
    <>
      <ProgrammaticHubSEO collections={collectionStats} />
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs items={getProgrammaticHubBreadcrumbs()} />

          <header className={styles.hero}>
                <h1 className={styles.title}>Pet care guides &amp; templates</h1>
                <p className={styles.lead}>
                  {PROGRAMMATIC_PAGE_COUNT} programmatic guides across {collections.length}{' '}
                  collections, plus {breedConditions.length} breed–condition clinical briefs —
                  vaccination schedules, travel checklists, emergency prep, and high-risk disease
                  timelines.
                </p>
              </header>

              <FeaturedBlogLinks title="Editorial guides" />

              <h2 className={styles.sectionTitle}>Breed clinical risks</h2>
              <div className={styles.grid}>
                {visibleBreedConditions.map((entry) => (
                  <Link
                    key={entry.slug}
                    to={getBreedConditionPath(entry)}
                    className={styles.card}
                  >
                    <h2 className={styles.cardTitle}>
                      {entry.condition} in {entry.breed}s
                    </h2>
                    <p className={styles.cardDesc}>{entry.scientificName}</p>
                    <span className={styles.cardMeta}>{entry.riskLevel} risk</span>
                    <span className={styles.cardLink}>Open clinical brief →</span>
                  </Link>
                ))}
              </div>
              {hasMoreBreeds && (
                <div className={styles.showMoreWrap}>
                  <button
                    type="button"
                    className={styles.showMore}
                    onClick={() => setBreedsExpanded((prev) => !prev)}
                    aria-expanded={breedsExpanded}
                  >
                    {breedsExpanded
                      ? 'Show fewer breed guides'
                      : `Show all ${breedConditions.length} breed guides`}
                  </button>
                </div>
              )}

              <h2 className={styles.sectionTitle}>Guide collections</h2>
              <div className={styles.grid}>
            {collections.map((collection) => (
              <Link
                key={collection.id}
                to={`${ROUTES.GUIDES}/${collection.id}`}
                className={styles.card}
              >
                <h2 className={styles.cardTitle}>{collection.label}</h2>
                <p className={styles.cardDesc}>{collection.hubCardDescription}</p>
                <span className={styles.cardMeta}>
                  {listProgrammaticPages(collection.id).length} guides
                </span>
                <span className={styles.cardLink}>Browse collection →</span>
              </Link>
            ))}
              </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { listProgrammaticCollections } from '@/data/programmatic/collections';
import { FeaturedBlogLinks } from '@/components/seo/FeaturedBlogLinks';
import { listProgrammaticPages, PROGRAMMATIC_PAGE_COUNT } from '@/data/programmatic';
import { listBreedConditions, getBreedConditionPath } from '@/data/breedConditions';
import { TOP_DOG_BREEDS, getLifecyclePath, EXPECTED_LIFECYCLE_URL_COUNT } from '@/data/lifecycleMatrix';
import { EXPECTED_RESOURCE_URL_COUNT } from '@/data/resourceMatrix';
import { listVaultPages } from '@/content/vaultPages';
import { ProgrammaticHubSEO, getProgrammaticHubBreadcrumbs } from '@/seo/programmaticSeo';
import { ROUTES } from '@/routes/paths';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const LIFECYCLE_PREVIEW_COUNT = 24;
  const [breedsExpanded, setBreedsExpanded] = useState(false);
  const [lifecycleExpanded, setLifecycleExpanded] = useState(false);
  const hasMoreBreeds = breedConditions.length > BREED_PREVIEW_COUNT;
  const visibleBreedConditions =
    breedsExpanded || !hasMoreBreeds
      ? breedConditions
      : breedConditions.slice(0, BREED_PREVIEW_COUNT);
  const hasMoreLifecycle = TOP_DOG_BREEDS.length > LIFECYCLE_PREVIEW_COUNT;
  const visibleLifecycleBreeds =
    lifecycleExpanded || !hasMoreLifecycle
      ? TOP_DOG_BREEDS
      : TOP_DOG_BREEDS.slice(0, LIFECYCLE_PREVIEW_COUNT);

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
                  collections, {listVaultPages().length} records-vault guides,{' '}
                  {breedConditions.length} breed-condition clinical briefs, and{' '}
                  {EXPECTED_LIFECYCLE_URL_COUNT.toLocaleString()} breed x lifecycle/diet pages and{' '}
                  {EXPECTED_RESOURCE_URL_COUNT.toLocaleString()} city record packets. Vaccination
                  schedules, travel checklists, emergency prep, and high-intent boarding files.
                </p>
              </header>

              <FeaturedBlogLinks title="Editorial guides" />

              <p className={styles.meta}>
                <Link to={ROUTES.RESOURCES}>Local boarding and ER packets</Link>
              </p>

              <h2 className={styles.sectionTitle}>Records vault guides</h2>
              <div className={styles.grid}>
                {listVaultPages()
                  .slice(0, 12)
                  .map((page) => (
                    <Link
                      key={page.slug}
                      to={`${ROUTES.GUIDES}/${page.slug}`}
                      className={styles.card}
                    >
                      <h2 className={styles.cardTitle}>{page.h1}</h2>
                      <p className={styles.cardDesc}>{page.pain_point}</p>
                      <span className={styles.cardMeta}>{page.cluster}</span>
                      <span className={styles.cardLink}>Open vault guide →</span>
                    </Link>
                  ))}
              </div>
              <p className={styles.meta}>
                {listVaultPages().length} long-tail vault guides covering organize, boarding,
                lost records, transfers, and sharing.
              </p>

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

              <h2 className={styles.sectionTitle}>Breed lifecycle &amp; diet guides</h2>
              <div className={styles.grid}>
                {visibleLifecycleBreeds.map((breed) => (
                  <Link
                    key={breed.slug}
                    to={getLifecyclePath(breed.slug, 'puppy-vaccination-schedule')}
                    className={styles.card}
                  >
                    <h2 className={styles.cardTitle}>{breed.name} lifecycle guides</h2>
                    <p className={styles.cardDesc}>
                      15 stages covering vaccination, diet, recovery, and senior care for this{' '}
                      {breed.size} breed.
                    </p>
                    <span className={styles.cardMeta}>{breed.healthFocus}</span>
                    <span className={styles.cardLink}>Open lifecycle cluster →</span>
                  </Link>
                ))}
              </div>
              {hasMoreLifecycle && (
                <div className={styles.showMoreWrap}>
                  <button
                    type="button"
                    className={styles.showMore}
                    onClick={() => setLifecycleExpanded((prev) => !prev)}
                    aria-expanded={lifecycleExpanded}
                  >
                    {lifecycleExpanded
                      ? 'Show fewer lifecycle breeds'
                      : `Show all ${TOP_DOG_BREEDS.length} lifecycle breeds`}
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

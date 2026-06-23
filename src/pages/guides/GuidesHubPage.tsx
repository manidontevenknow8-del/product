import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { listProgrammaticCollections } from '@/data/programmatic/collections';
import { FeaturedBlogLinks } from '@/components/seo/FeaturedBlogLinks';
import { listProgrammaticPages, PROGRAMMATIC_PAGE_COUNT } from '@/data/programmatic';
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
                  collections — vaccination schedules by breed, travel checklists by country,
                  emergency prep by species, and templates for medications and health records.
                </p>
              </header>

              <FeaturedBlogLinks title="Editorial guides" />

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

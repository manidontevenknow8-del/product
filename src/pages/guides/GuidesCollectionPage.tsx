import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Button } from '@/components/ui';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { getProgrammaticCollection } from '@/data/programmatic/collections';
import { isProgrammaticCollectionId, listProgrammaticPages } from '@/data/programmatic';
import {
  ProgrammaticCollectionSEO,
  ProgrammaticNotFoundSEO,
  getProgrammaticCollectionBreadcrumbs,
} from '@/seo/programmaticSeo';
import { ROUTES } from '@/routes/paths';
import styles from './GuidesPages.module.css';

export function GuidesCollectionPage() {
  const { collection } = useParams<{ collection: string }>();
  const validCollection = collection && isProgrammaticCollectionId(collection) ? collection : null;
  const collectionMeta = validCollection ? getProgrammaticCollection(validCollection) : null;
  const pages = validCollection ? listProgrammaticPages(validCollection) : [];

  return (
    <>
      <Header variant="landing" />
      {validCollection && <ProgrammaticCollectionSEO collectionId={validCollection} pages={pages} />}
      {!validCollection && <ProgrammaticNotFoundSEO collectionId={collection} />}

      <div className={styles.page}>
        <div className={styles.inner}>
          {validCollection && (
            <Breadcrumbs items={getProgrammaticCollectionBreadcrumbs(validCollection)} />
          )}

          {!validCollection && (
            <div className={styles.stateWrap}>
              <h1>Collection not found</h1>
              <p>That guide collection does not exist.</p>
              <Link to={ROUTES.GUIDES}>
                <Button variant="secondary">Browse all guides</Button>
              </Link>
            </div>
          )}

          {collectionMeta && (
            <>
              <header className={styles.hero}>
                <h1 className={styles.title}>{collectionMeta.label}</h1>
                <p className={styles.lead}>{collectionMeta.description}</p>
              </header>

              <div className={styles.grid}>
                {pages.map((page) => (
                  <Link
                    key={page.slug}
                    to={`${ROUTES.GUIDES}/${page.collectionId}/${page.slug}`}
                    className={styles.card}
                  >
                    <h2 className={styles.cardTitle}>{page.subjectName}</h2>
                    <p className={styles.cardDesc}>{page.quickAnswer}</p>
                    <span className={styles.cardLink}>Open guide →</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

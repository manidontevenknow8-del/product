import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { SymptomGuideTemplate } from '@/templates/SymptomGuideTemplate';
import { getSymptomBySlug, symptoms } from '@/content/loadContentData';
import {
  getSymptomGuidePage,
  listLoadedSymptomGuidePages,
  listLoadedSymptomGuideBatchCount,
  symptomGuideManifest,
} from '@/content/loadSymptomGuidePages';

export function SymptomGuidePage() {
  const { species = '', slug = '' } = useParams<{ species: string; slug: string }>();
  const page = getSymptomGuidePage(species, slug);

  if (!page) {
    return (
      <>
        <Header variant="landing" />
        <main style={{ maxWidth: '40rem', margin: '2rem auto', padding: '0 1.25rem' }}>
          <h1>Symptom guide not found</h1>
          <p>
            No generated page for <code>/symptoms/{species}/{slug}</code>.
          </p>
          <p>
            Catalog size: {symptomGuideManifest.totalPages} pages across{' '}
            {symptomGuideManifest.batchCount} batches. Loaded:{' '}
            {listLoadedSymptomGuidePages().length} pages ({listLoadedSymptomGuideBatchCount()}{' '}
            batch files).
          </p>
          <p>
            <Link to="/symptoms">Back to symptoms index</Link>
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const symptom =
    getSymptomBySlug(page.symptomSlug) ??
    getSymptomBySlug(page.symptomSlugs[0]) ??
    symptoms[0];

  if (!symptom) {
    return (
      <>
        <Header variant="landing" />
        <p>Missing symptom record for {page.symptomSlug}.</p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header variant="landing" />
      <SymptomGuideTemplate
        symptom={symptom}
        path={page.path}
        primaryKeyword={page.primaryKeyword}
        metaDescription={page.metaDescription}
        h1={page.h1}
        lead={page.lead}
        disclaimer={page.disclaimer}
        page={page}
        body={<></>}
        faqs={page.faqs}
      />
      <Footer />
    </>
  );
}

export default SymptomGuidePage;

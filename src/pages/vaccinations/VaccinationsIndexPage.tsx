import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { breeds } from '@/content/loadContentData';
import vaccinationManifest from '@content-data/generated/vaccinations/_manifest.json';

type Manifest = {
  count: number;
  pages: { slug: string; path: string; kind: string; breedSlug: string | null }[];
};

const manifest = vaccinationManifest as Manifest;

export function VaccinationsIndexPage() {
  const breedPages = manifest.pages.filter((p) => p.kind === 'breed');
  const generalPages = manifest.pages.filter((p) => p.kind === 'general');
  const breedBySlug = new Map(breeds.map((b) => [b.slug, b]));

  const dogBreedPages = breedPages.filter(
    (p) => breedBySlug.get(p.breedSlug || '')?.species === 'dog',
  );
  const catBreedPages = breedPages.filter(
    (p) => breedBySlug.get(p.breedSlug || '')?.species === 'cat',
  );

  return (
    <>
      <Header variant="landing" />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        <h1>Vaccination schedules</h1>
        <p>
          {manifest.count} guides: general species/situation schedules plus breed-specific core
          series. Each breed page links to its matching health guide.
        </p>

        <h2 id="general">General schedules ({generalPages.length})</h2>
        <ul>
          {generalPages.map((p) => (
            <li key={p.slug}>
              <Link to={p.path}>{p.slug.replace(/-/g, ' ')}</Link>
            </li>
          ))}
        </ul>

        <h2 id="dogs">Dog breeds ({dogBreedPages.length})</h2>
        <ul>
          {dogBreedPages.map((p) => (
            <li key={p.slug}>
              <Link to={p.path}>
                {(breedBySlug.get(p.breedSlug || '')?.name ??
                  p.slug.replace(/-vaccine-schedule$/, '')).replace(/-/g, ' ')}
              </Link>
            </li>
          ))}
        </ul>

        <h2 id="cats">Cat breeds ({catBreedPages.length})</h2>
        <ul>
          {catBreedPages.map((p) => (
            <li key={p.slug}>
              <Link to={p.path}>
                {(breedBySlug.get(p.breedSlug || '')?.name ??
                  p.slug.replace(/-vaccine-schedule$/, '')).replace(/-/g, ' ')}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}

export default VaccinationsIndexPage;

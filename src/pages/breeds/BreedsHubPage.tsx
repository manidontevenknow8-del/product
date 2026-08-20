import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { breeds } from '@/content/loadContentData';
import { listBreedHealthIndex } from '@/content/breedHealthPages';
import type { SizeCategory } from '@content-types/breed';

const SIZE_ORDER: SizeCategory[] = ['toy', 'small', 'medium', 'large', 'giant', 'n/a'];

export function BreedsHubPage() {
  const index = listBreedHealthIndex();
  const byBreed = new Map<string, typeof index>();
  for (const entry of index) {
    if (!byBreed.has(entry.breedSlug)) byBreed.set(entry.breedSlug, []);
    byBreed.get(entry.breedSlug)!.push(entry);
  }

  const breedList = breeds.filter((b) => byBreed.has(b.slug));
  const speciesList = ['dog', 'cat'] as const;

  return (
    <>
      <Header variant="landing" />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        <h1>Breed health guides</h1>
        <p>
          {index.length} breed × life-stage guides, grouped by species and size. Jump from a breed to
          its puppy/kitten, adult, and senior pages.
        </p>

        <nav aria-label="Species" style={{ display: 'flex', gap: '1rem', margin: '1.25rem 0' }}>
          {speciesList.map((species) => (
            <a key={species} href={`#${species}`}>
              {species === 'dog' ? 'Dogs' : 'Cats'}
            </a>
          ))}
        </nav>

        {speciesList.map((species) => {
          const inSpecies = breedList.filter((b) => b.species === species);
          return (
            <section key={species} id={species} style={{ marginTop: '2.5rem' }}>
              <h2 style={{ textTransform: 'capitalize' }}>
                {species}s ({inSpecies.length} breeds)
              </h2>
              {SIZE_ORDER.map((size) => {
                const group = inSpecies.filter((b) => b.size_category === size);
                if (group.length === 0) return null;
                const anchor = `${species}-${size}`;
                return (
                  <section key={anchor} id={anchor} style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ textTransform: 'capitalize' }}>
                      {size === 'n/a' ? 'Size not categorized' : `${size}`} ({group.length})
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {group.map((breed) => (
                        <li key={breed.slug} style={{ marginBottom: '1rem' }}>
                          <strong>{breed.name}</strong>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.75rem',
                              marginTop: '0.35rem',
                            }}
                          >
                            {(byBreed.get(breed.slug) || []).map((entry) => (
                              <Link key={entry.path} to={entry.path}>
                                {entry.stage} health guide
                              </Link>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </section>
          );
        })}
      </main>
      <Footer />
    </>
  );
}

export default BreedsHubPage;

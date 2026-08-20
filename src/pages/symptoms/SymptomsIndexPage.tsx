import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { listLoadedSymptomGuidePages, symptomGuideManifest } from '@/content/loadSymptomGuidePages';

const URGENCY_ORDER = ['emergency', 'urgent', 'monitor'] as const;

export function SymptomsIndexPage() {
  const pages = listLoadedSymptomGuidePages().sort((a, b) => a.h1.localeCompare(b.h1));
  const speciesList = ['dog', 'cat'] as const;

  return (
    <>
      <Header variant="landing" />
      <main style={{ maxWidth: '44rem', margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
        <h1>Symptom guides</h1>
        <p
          role="note"
          style={{ background: '#f7f5f1', padding: '0.75rem 0.9rem', borderLeft: '3px solid #6b6560' }}
        >
          This is general information, not a diagnosis. Contact your vet for anything urgent or
          unclear.
        </p>
        <p>
          {symptomGuideManifest.totalPages} guides across {symptomGuideManifest.batchCount} batches.
          Grouped by urgency, then species.
        </p>

        <nav aria-label="Urgency" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '1rem 0' }}>
          {URGENCY_ORDER.map((u) => (
            <a key={u} href={`#urgency-${u}`}>
              {u}
            </a>
          ))}
        </nav>

        {URGENCY_ORDER.map((urgency) => {
          const inUrgency = pages.filter((p) => p.urgency_level === urgency);
          return (
            <section key={urgency} id={`urgency-${urgency}`} style={{ marginTop: '2.25rem' }}>
              <h2 style={{ textTransform: 'capitalize' }}>
                {urgency} ({inUrgency.length})
              </h2>
              {speciesList.map((species) => {
                const group = inUrgency.filter((p) => p.species === species);
                if (group.length === 0) return null;
                return (
                  <section
                    key={`${urgency}-${species}`}
                    id={`urgency-${urgency}-${species}`}
                    style={{ marginTop: '1rem' }}
                  >
                    <h3 style={{ textTransform: 'capitalize' }}>
                      {species}s ({group.length})
                    </h3>
                    <ul>
                      {group.map((p) => (
                        <li key={p.path}>
                          <Link to={p.path}>{p.h1}</Link>
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

export default SymptomsIndexPage;

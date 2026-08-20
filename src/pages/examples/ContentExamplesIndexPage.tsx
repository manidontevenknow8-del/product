import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';

const EXAMPLES = [
  { href: '/examples/breed-health/labrador-retriever', label: 'BreedHealthTemplate', record: 'labrador-retriever + dog-adult' },
  { href: '/examples/symptom/vomiting-dog', label: 'SymptomGuideTemplate', record: 'vomiting-dog' },
  { href: '/examples/vaccination/labrador-retriever', label: 'VaccinationScheduleTemplate', record: 'labrador-retriever vaccines' },
  { href: '/examples/emergency/chocolate-toxicity', label: 'EmergencyGuideTemplate', record: 'chocolate-toxicity' },
  { href: '/examples/vault/digital-pet-passport', label: 'RecordsVaultTemplate', record: 'hand-authored vault facts' },
  { href: '/examples/life-logistics/pet-sitter-handoff', label: 'LifeLogisticsTemplate', record: 'sitter handoff facts' },
  { href: '/examples/compare/11pets', label: 'ComparisonTemplate', record: '11pets' },
  { href: '/examples/tools/printable-pet-vaccine-checklist', label: 'ToolTemplate', record: 'gated vaccine checklist (tools.json)' },
] as const;

export function ContentExamplesIndexPage() {
  return (
    <>
      <Header variant="landing" />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        <h1 style={{ marginTop: 0 }}>Content template examples</h1>
        <p>
          One working page per pillar template. Sample data only. noIndex. Not for production
          indexing.
        </p>
        <ol>
          {EXAMPLES.map((item) => (
            <li key={item.href} style={{ marginBottom: '0.75rem' }}>
              <Link to={item.href}>{item.label}</Link>
              <div style={{ color: '#555', fontSize: '0.9rem' }}>{item.record}</div>
            </li>
          ))}
        </ol>
      </main>
      <Footer />
    </>
  );
}

export default ContentExamplesIndexPage;

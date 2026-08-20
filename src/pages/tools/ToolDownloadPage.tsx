import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { ToolTemplate } from '@/templates/ToolTemplate';
import { getToolBySlug, tools } from '@/content/loadContentData';
import { NotFoundPage } from '@/pages/NotFoundPage';

const RESERVED_TOOL_SLUGS = new Set(['vaccine-scheduler', 'qr-generator', 'downloads']);

export function ToolDownloadPage() {
  const { slug = '' } = useParams<{ slug: string }>();

  if (RESERVED_TOOL_SLUGS.has(slug)) {
    return <NotFoundPage />;
  }

  const tool = getToolBySlug(slug);
  if (!tool) {
    return <NotFoundPage />;
  }

  const path = `/tools/${tool.slug}`;

  return (
    <>
      <Header variant="landing" />
      <ToolTemplate tool={tool} path={path} noIndex={false} />
      <Footer />
    </>
  );
}

export default ToolDownloadPage;

/** Lightweight hub for crawlers and internal links. */
export function ToolsDownloadsHubPage() {
  const families = [
    'vaccination-record',
    'emergency-card',
    'vet-visit-log',
    'pet-sitter-instructions',
  ] as const;

  return (
    <>
      <Header variant="landing" />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        <h1>Printable pet tools and templates</h1>
        <p>
          Downloadable vaccination sheets, emergency cards, vet visit logs, and pet sitter
          instructions. Each PDF unlocks with a free PetClues account so you can store it beside
          your vault.
        </p>
        {families.map((family) => {
          const items = tools.filter((t) => t.family === family);
          return (
            <section key={family} style={{ marginTop: '2rem' }}>
              <h2 style={{ textTransform: 'capitalize' }}>{family.replace(/-/g, ' ')}</h2>
              <ul>
                {items.map((t) => (
                  <li key={t.slug}>
                    <Link to={`/tools/${t.slug}`}>{t.h1}</Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <Footer />
    </>
  );
}

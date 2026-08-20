import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { lifeLogisticsPages } from '@/content/loadLifeLogistics';
import { ROUTES } from '@/routes/paths';
import { Breadcrumbs } from '@/components/content';

export function LifeLogisticsHubPage() {
  const pages = lifeLogisticsPages;
  const clusters = [...new Set(pages.map((p) => p.cluster))].sort();

  return (
    <>
      <Header variant="landing" />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        <Breadcrumbs
          path={[
            { label: 'Home', href: ROUTES.LANDING },
            { label: 'Life logistics' },
          ]}
        />
        <h1>Life logistics guides</h1>
        <p>
          {pages.length} guides for moving, travel, sitters, multi-pet homes, boarding, and custody
          handoffs. Grouped by cluster; each page is under /guides.
        </p>
        <nav aria-label="Clusters" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', margin: '1rem 0' }}>
          {clusters.map((c) => (
            <a key={c} href={`#cluster-${c}`}>
              {c.replace(/-/g, ' ')}
            </a>
          ))}
        </nav>
        {clusters.map((cluster) => {
          const group = pages.filter((p) => p.cluster === cluster);
          return (
            <section key={cluster} id={`cluster-${cluster}`} style={{ marginTop: '2rem' }}>
              <h2 style={{ textTransform: 'capitalize' }}>
                {cluster.replace(/-/g, ' ')} ({group.length})
              </h2>
              <ul>
                {group.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/guides/${p.slug}`}>{p.h1}</Link>
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

export default LifeLogisticsHubPage;

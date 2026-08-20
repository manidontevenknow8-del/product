import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/content';
import { EMERGENCY_HEALTH_DISCLAIMER } from '@/templates/EmergencyGuideTemplate';
import { emergencies } from '@/content/loadContentData';
import { emergencyGuidePages } from '@/content/loadEmergencyGuides';
import { ROUTES } from '@/routes/paths';
import { MetaTags } from '@/seo/MetaTags';
import { SITE_META } from '@/data/seoConfig';

export function EmergencyHubPage() {
  const byCore = emergencies.map((core) => ({
    core,
    pages: emergencyGuidePages.filter((p) => p.core_slug === core.slug),
  }));

  return (
    <>
      <MetaTags
        config={{
          title: 'Pet emergency guides | PetClues',
          description:
            'Calm, step-by-step pet emergency guides — what to do first, when to call poison control vs the ER, and how to keep vet contacts ready.',
          canonical: `${SITE_META.siteUrl}/emergency`,
          ogType: 'website',
          ogTitle: 'Pet emergency guides | PetClues',
          ogDescription:
            'Calm, step-by-step pet emergency guides — what to do first, when to call poison control vs the ER, and how to keep vet contacts ready.',
          noIndex: false,
        }}
      />
      <Header variant="landing" />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>
        <Breadcrumbs
          path={[
            { label: 'Home', href: ROUTES.LANDING },
            { label: 'Emergency guides' },
          ]}
        />
        <h1>Pet emergency guides</h1>
        <p>
          Numbered first actions, clear vet vs poison-control vs ER guidance, and space to store
          clinic contacts before you need them.
        </p>
        {byCore.map(({ core, pages }) =>
          pages.length === 0 ? null : (
            <section key={core.slug} style={{ marginTop: '2rem' }}>
              <h2>{core.name}</h2>
              <ul>
                {pages.map((page) => (
                  <li key={page.slug}>
                    <Link to={`/emergency/${page.slug}`}>{page.h1}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ),
        )}
        <p role="note" style={{ marginTop: '2.5rem', opacity: 0.9 }}>
          {EMERGENCY_HEALTH_DISCLAIMER}
        </p>
      </main>
      <Footer />
    </>
  );
}

export default EmergencyHubPage;

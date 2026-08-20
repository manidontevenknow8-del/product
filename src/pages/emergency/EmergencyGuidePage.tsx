import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Button } from '@/components/ui';
import {
  EmergencyGuideTemplate,
  EMERGENCY_HEALTH_DISCLAIMER,
} from '@/templates/EmergencyGuideTemplate';
import { getEmergencyBySlug } from '@/content/loadContentData';
import { getEmergencyGuidePageBySlug } from '@/content/loadEmergencyGuides';
import { ROUTES } from '@/routes/paths';

function EmergencyGuideNotFound() {
  return (
    <>
      <Header variant="landing" />
      <main style={{ maxWidth: 640, margin: '4rem auto', padding: '0 1.25rem' }}>
        <h1>Emergency guide not found</h1>
        <p>That emergency URL is not in the PetClues guide set yet.</p>
        <p role="note">{EMERGENCY_HEALTH_DISCLAIMER}</p>
        <Link to="/emergency">
          <Button variant="secondary">All emergency guides</Button>
        </Link>
      </main>
      <Footer />
    </>
  );
}

export function EmergencyGuidePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const page = getEmergencyGuidePageBySlug(slug);
  const emergency = page ? getEmergencyBySlug(page.core_slug) : undefined;

  if (!page || !emergency) return <EmergencyGuideNotFound />;

  const path = `/emergency/${page.slug}`;

  return (
    <>
      <Header variant="landing" />
      <EmergencyGuideTemplate
        emergency={emergency}
        path={path}
        primaryKeyword={page.primary_keyword}
        metaDescription={page.meta_description}
        h1={page.h1}
        lead={page.lead}
        page={page}
        noIndex={false}
        ctaHref={ROUTES.SIGNUP}
        faqs={page.faqs}
        body={
          <>
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </section>
            ))}
          </>
        }
      />
      <Footer />
    </>
  );
}

export default EmergencyGuidePage;

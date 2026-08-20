import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { EmergencyGuideTemplate } from '@/templates/EmergencyGuideTemplate';
import { getEmergencyBySlug } from '@/content/loadContentData';
import { ROUTES } from '@/routes/paths';

export function ExampleEmergencyGuidePage() {
  const { slug = 'chocolate-toxicity' } = useParams<{ slug: string }>();
  const emergency = getEmergencyBySlug(slug) ?? getEmergencyBySlug('chocolate-toxicity');
  if (!emergency) return <p>Missing emergency sample.</p>;

  const path = `/examples/emergency/${emergency.slug}`;

  return (
    <>
      <Header variant="landing" />
      <EmergencyGuideTemplate
        emergency={emergency}
        path={path}
        primaryKeyword={`${emergency.name} what to do`}
        metaDescription={`${emergency.name} what to do: action steps and when to call poison control vs the vet. Set PetClues up before you need it.`}
        noIndex
        breadcrumbs={[
          { label: 'Home', href: ROUTES.LANDING },
          { label: 'Examples', href: '/examples' },
          { label: 'Emergencies', href: '/examples' },
          { label: emergency.name },
        ]}
        body={
          <>
            <h2>Use the action list first</h2>
            <p>
              The steps and vet-vs-poison-control field above are the unique data for this URL. Body
              copy stays short in this template example.
            </p>
          </>
        }
        faqs={[
          {
            question: 'Should I call poison control or the ER first?',
            answer: emergency.when_to_call_vet_vs_poison_control,
          },
        ]}
      />
      <Footer />
    </>
  );
}

export default ExampleEmergencyGuidePage;

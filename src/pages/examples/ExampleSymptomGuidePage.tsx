import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { SymptomGuideTemplate } from '@/templates/SymptomGuideTemplate';
import { getSymptomBySlug } from '@/content/loadContentData';

export function ExampleSymptomGuidePage() {
  const { slug = 'vomiting-dog' } = useParams<{ slug: string }>();
  const symptom = getSymptomBySlug(slug) ?? getSymptomBySlug('vomiting-dog');
  if (!symptom) return <p>Missing symptom sample.</p>;

  const base = symptom.slug.replace(/-dog$|-cat$/, '');
  const path = `/symptoms/${symptom.species}/${base}-when-to-worry`;

  return (
    <>
      <Header variant="landing" />
      <SymptomGuideTemplate
        symptom={symptom}
        path={path}
        primaryKeyword={`${symptom.name} when to see a vet`}
        metaDescription={`${symptom.name} when to see a vet: urgency level, causes, and red flags from PetClues symptom data. Start a free trial to log episodes.`}
        body={
          <>
            <h2>What this page is for</h2>
            <p>
              Use the red-flag list above as a triage aid, not a diagnosis. Escalate when any
              immediate-care sign appears.
            </p>
          </>
        }
        faqs={[
          {
            question: `Is ${symptom.name.toLowerCase()} always an emergency?`,
            answer: `This record marks urgency as ${symptom.urgency_level}. Escalate immediately when any red-flag sign in the list appears. This is general information, not a diagnosis. Contact your vet for anything urgent or unclear.`,
          },
        ]}
      />
      <Footer />
    </>
  );
}

export default ExampleSymptomGuidePage;

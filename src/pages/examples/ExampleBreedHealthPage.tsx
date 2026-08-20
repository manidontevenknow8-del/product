import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { BreedHealthTemplate } from '@/templates/BreedHealthTemplate';
import { getBreedBySlug, getLifeStageBySlug } from '@/content/loadContentData';

export function ExampleBreedHealthPage() {
  const { slug = 'labrador-retriever' } = useParams<{ slug: string }>();
  const breed = getBreedBySlug(slug) ?? getBreedBySlug('labrador-retriever');
  const lifeStage =
    getLifeStageBySlug(breed?.species === 'cat' ? 'cat-adult' : 'dog-adult') ??
    getLifeStageBySlug('dog-adult');

  if (!breed || !lifeStage) {
    return <p>Missing sample breed or life stage data.</p>;
  }

  const path = `/examples/breed-health/${breed.slug}`;

  return (
    <>
      <Header variant="landing" />
      <BreedHealthTemplate
        breed={breed}
        lifeStage={lifeStage}
        path={path}
        primaryKeyword={`${breed.name} adult care guide`}
        metaDescription={`${breed.name} adult care guide with weight range, health issues, and checklist. Soft CTA: start a free PetClues trial.`}
        body={
          <>
            <h2>How to use this guide</h2>
            <p>
              The table above is the unique data for this page. Keep the checklist next to vaccine
              certificates so boarding and annual exams stay honest.
            </p>
            <p>
              This body slot is where per-page markdown or MDX will mount later. No batch content
              generation in this pass.
            </p>
          </>
        }
        faqs={[
          {
            question: `What weight range should an adult ${breed.name} sit in?`,
            answer: `This record lists ${breed.avg_weight_range}. Individual targets come from your veterinarian and body condition score.`,
          },
          {
            question: `Which health issues should ${breed.name} owners watch?`,
            answer: `${breed.common_health_issues.join('; ')}.`,
          },
        ]}
      />
      <Footer />
    </>
  );
}

export default ExampleBreedHealthPage;

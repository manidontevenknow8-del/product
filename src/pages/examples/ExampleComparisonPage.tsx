import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { ComparisonTemplate } from '@/templates/ComparisonTemplate';
import { getComparisonBySlug } from '@/content/loadContentData';

export function ExampleComparisonPage() {
  const { slug = '11pets' } = useParams<{ slug: string }>();
  const competitor = getComparisonBySlug(slug) ?? getComparisonBySlug('11pets');
  if (!competitor) return <p>Missing comparison sample.</p>;

  const path = `/examples/compare/${competitor.slug}`;

  return (
    <>
      <Header variant="landing" />
      <ComparisonTemplate
        competitor={competitor}
        path={path}
        primaryKeyword={`PetClues vs ${competitor.name}`}
        metaDescription={`PetClues vs ${competitor.name} with verified feature rows from comparisons.json. Soft CTA: founding member pricing before it closes.`}
        body={
          <>
            <h2>How to read this comparison</h2>
            <p>
              Every feature row cites a source. Do not invent capabilities beyond the JSON record.
            </p>
          </>
        }
        faqs={[
          {
            question: `What category is ${competitor.name}?`,
            answer: `${competitor.category.replace(/-/g, ' ')}.`,
          },
        ]}
      />
      <Footer />
    </>
  );
}

export default ExampleComparisonPage;

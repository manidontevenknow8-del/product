import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { ToolTemplate } from '@/templates/ToolTemplate';
import { getToolBySlug } from '@/content/loadContentData';

/** Example / noIndex wrapper — production pages live at /tools/:slug. */
export function ExampleToolPage() {
  const { slug = 'printable-pet-vaccine-checklist' } = useParams<{ slug: string }>();
  const tool =
    getToolBySlug(slug) ?? getToolBySlug('printable-pet-vaccine-checklist') ?? getToolBySlug('dog-vaccination-record-sheet');

  if (!tool) {
    return <p>Missing tool sample.</p>;
  }

  const path = `/examples/tools/${tool.slug}`;

  return (
    <>
      <Header variant="landing" />
      <ToolTemplate tool={tool} path={path} noIndex />
      <Footer />
    </>
  );
}

export default ExampleToolPage;

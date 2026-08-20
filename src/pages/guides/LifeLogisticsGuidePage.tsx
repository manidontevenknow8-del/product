import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { LifeLogisticsTemplate } from '@/templates/LifeLogisticsTemplate';
import { getLogisticsRelatedLinksForPage } from '@/templates/related/contentRelatedLinks';
import type { LifeLogisticsPageRecord } from '@content-types/life-logistics';
import { ROUTES } from '@/routes/paths';

type Props = {
  page: LifeLogisticsPageRecord;
};

export function LifeLogisticsGuidePage({ page }: Props) {
  const path = `/guides/${page.slug}`;

  return (
    <>
      <Header variant="landing" />
      <LifeLogisticsTemplate
        path={path}
        primaryKeyword={page.primary_keyword}
        metaDescription={page.meta_description}
        h1={page.h1}
        lead={page.lead}
        dataRows={page.data_rows}
        dataLists={page.data_lists}
        noIndex={false}
        breadcrumbs={[
          { label: 'Home', href: ROUTES.LANDING },
          { label: 'Life logistics', href: '/life-logistics' },
          { label: page.h1 },
        ]}
        related={getLogisticsRelatedLinksForPage(page.slug, page.cluster)}
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
        faqs={page.faqs}
      />
      <Footer />
    </>
  );
}

export default LifeLogisticsGuidePage;

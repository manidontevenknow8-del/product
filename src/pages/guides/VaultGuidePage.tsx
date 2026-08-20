import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { RecordsVaultTemplate } from '@/templates/RecordsVaultTemplate';
import type { RecordsVaultPageRecord } from '@content-types/records-vault';
import { getVaultRelatedPages } from '@/content/vaultPages';
import { ROUTES } from '@/routes/paths';

type VaultGuidePageProps = {
  page: RecordsVaultPageRecord;
};

export function VaultGuidePage({ page }: VaultGuidePageProps) {
  const path = `${ROUTES.GUIDES}/${page.slug}`;
  const related = getVaultRelatedPages(page).map((item) => ({
    href: `${ROUTES.GUIDES}/${item.slug}`,
    label: item.h1,
    description: item.pain_point,
  }));

  return (
    <>
      <Header variant="landing" />
      <RecordsVaultTemplate
        path={path}
        primaryKeyword={page.h1}
        metaDescription={page.meta_description}
        h1={page.h1}
        lead={page.lead}
        noIndex={false}
        breadcrumbs={[
          { label: 'Home', href: ROUTES.LANDING },
          { label: 'Guides', href: ROUTES.GUIDES },
          { label: 'Records vault', href: '/vault' },
          { label: page.h1 },
        ]}
        dataRows={page.data_rows}
        dataLists={[{ heading: page.checklist_heading, items: page.checklist }]}
        cta={{
          headline: page.cta.headline,
          subtext: page.cta.subtext,
          buttonText: page.cta.button_text,
        }}
        related={related}
        relatedHeading="Related vault guides"
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

export default VaultGuidePage;

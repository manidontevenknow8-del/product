import type { ReactNode } from 'react';
import type { ComparisonRecord } from '@content-types/comparison';
import type { BreadcrumbPathItem } from '@/components/content';
import { ROUTES } from '@/routes/paths';
import { ContentTemplateShell, type ContentFaq } from './shared/ContentTemplateShell';
import { buildContentMeta } from './shared/buildContentMeta';
import { getRelatedComparisons } from './related/contentRelatedLinks';
import styles from './ComparisonTemplate.module.css';

export type ComparisonTemplateProps = {
  competitor: ComparisonRecord;
  path: string;
  primaryKeyword: string;
  metaDescription: string;
  body: ReactNode;
  faqs?: ContentFaq[];
  ctaHref?: string;
  breadcrumbs?: BreadcrumbPathItem[];
  /** Production compare pages index; /examples stay noIndex (default). */
  noIndex?: boolean;
};

export function ComparisonTemplate({
  competitor,
  path,
  primaryKeyword,
  metaDescription,
  body,
  faqs,
  ctaHref = ROUTES.FOUNDING_MEMBERS,
  breadcrumbs,
  noIndex = true,
}: ComparisonTemplateProps) {
  const crumbs: BreadcrumbPathItem[] = breadcrumbs ?? [
    { label: 'Home', href: ROUTES.LANDING },
    { label: 'Examples', href: '/examples' },
    { label: 'Compare', href: '/examples' },
    { label: competitor.name },
  ];

  return (
    <ContentTemplateShell
      meta={buildContentMeta({ primaryKeyword, description: metaDescription, path })}
      breadcrumbs={crumbs}
      h1={`PetClues vs ${competitor.name}`}
      lead={competitor.identity_note ?? `${competitor.category.replace(/-/g, ' ')} comparison`}
      dataTitle={`${competitor.name} verified features`}
      dataRows={competitor.features.map((f) => ({
        label: f.feature,
        value: `${f.value} (source: ${f.source})`,
      }))}
      dataLists={
        competitor.website
          ? [{ heading: 'Competitor site', items: [competitor.website] }]
          : undefined
      }
      body={body}
      noIndex={noIndex}
      cta={{
        variant: 'comparison',
        headline: 'Founding member pricing will not stay open',
        subtext: 'Compare on features, then lock founding rates while the vault is still early.',
        buttonText: 'See founding member offer',
        href: ctaHref,
      }}
      afterCta={
        <div className={styles.pricingStrip} aria-label="Pricing framing">
          <h2 className={styles.pricingTitle}>Quick pricing frame</h2>
          <table className={styles.pricingTable}>
            <thead>
              <tr>
                <th scope="col">Option</th>
                <th scope="col">What you get</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Paper / status quo</td>
                <td>No reminders, easy to lose at the worst moment</td>
              </tr>
              <tr>
                <td>{competitor.name}</td>
                <td>{competitor.category.replace(/-/g, ' ')} (see feature table above)</td>
              </tr>
              <tr>
                <td>PetClues founding</td>
                <td>Owner-owned vault + reminders; founding urgency on pricing page</td>
              </tr>
            </tbody>
          </table>
        </div>
      }
      related={getRelatedComparisons(competitor)}
      relatedHeading="Other comparisons"
      faqs={faqs}
    />
  );
}

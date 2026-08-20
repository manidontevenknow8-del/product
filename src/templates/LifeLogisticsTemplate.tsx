import type { ReactNode } from 'react';
import { ROUTES } from '@/routes/paths';
import { ContentTemplateShell, type ContentFaq } from './shared/ContentTemplateShell';
import { buildContentMeta } from './shared/buildContentMeta';
import { getLogisticsRelatedLinks } from './related/contentRelatedLinks';
import type { DataFactRow } from './shared/DataFacts';

export type LifeLogisticsTemplateProps = {
  path: string;
  primaryKeyword: string;
  metaDescription: string;
  h1: string;
  lead?: string;
  dataRows: DataFactRow[];
  dataLists?: { heading: string; items: string[] }[];
  body: ReactNode;
  faqs?: ContentFaq[];
  ctaHref?: string;
  /** Production /guides pages are indexable; example routes stay noIndex. */
  noIndex?: boolean;
  breadcrumbs?: { label: string; href?: string }[];
  related?: { href: string; label: string; description?: string }[];
};

export function LifeLogisticsTemplate({
  path,
  primaryKeyword,
  metaDescription,
  h1,
  lead,
  dataRows,
  dataLists,
  body,
  faqs,
  ctaHref = ROUTES.SIGNUP,
  noIndex = true,
  breadcrumbs,
  related,
}: LifeLogisticsTemplateProps) {
  return (
    <ContentTemplateShell
      meta={buildContentMeta({ primaryKeyword, description: metaDescription, path })}
      noIndex={noIndex}
      breadcrumbs={
        breadcrumbs ?? [
          { label: 'Home', href: ROUTES.LANDING },
          { label: 'Examples', href: '/examples' },
          { label: 'Life logistics', href: '/examples' },
          { label: h1 },
        ]
      }
      h1={h1}
      lead={lead}
      dataTitle="Logistics checklist facts"
      dataRows={dataRows}
      dataLists={dataLists}
      body={body}
      cta={{
        variant: 'trial',
        headline: 'Share multi-pet profiles with sitters, movers, and co-parents',
        subtext:
          'Start a free trial to keep every pet on its own profile—and send one read-only link instead of five PDFs.',
        buttonText: 'Start free trial',
        href: ctaHref,
      }}
      related={related ?? getLogisticsRelatedLinks()}
      relatedHeading="Related logistics guides"
      faqs={faqs}
    />
  );
}

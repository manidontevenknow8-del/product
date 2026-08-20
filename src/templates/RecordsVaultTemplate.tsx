import type { ReactNode } from 'react';
import { ROUTES } from '@/routes/paths';
import {
  ContentTemplateShell,
  type ContentFaq,
} from './shared/ContentTemplateShell';
import { buildContentMeta } from './shared/buildContentMeta';
import { getVaultRelatedLinks } from './related/contentRelatedLinks';
import type { DataFactRow } from './shared/DataFacts';
import type { BreadcrumbPathItem, CTABlockProps, RelatedLinkItem } from '@/components/content';

export type RecordsVaultTemplateProps = {
  path: string;
  primaryKeyword: string;
  metaDescription: string;
  h1: string;
  lead?: string;
  /** Hand-authored unique facts for this long-tail page. */
  dataRows: DataFactRow[];
  dataLists?: { heading: string; items: string[] }[];
  body: ReactNode;
  faqs?: ContentFaq[];
  ctaHref?: string;
  /** Example routes stay noIndex; production /guides vault pages set false. */
  noIndex?: boolean;
  breadcrumbs?: BreadcrumbPathItem[];
  /** Override default vault CTA copy (pain-point specific). */
  cta?: Partial<Pick<CTABlockProps, 'headline' | 'subtext' | 'buttonText'>>;
  related?: RelatedLinkItem[];
  relatedHeading?: string;
};

export function RecordsVaultTemplate({
  path,
  primaryKeyword,
  metaDescription,
  h1,
  lead,
  dataRows,
  dataLists,
  body,
  faqs,
  ctaHref = ROUTES.PRICING,
  noIndex = true,
  breadcrumbs,
  cta,
  related,
  relatedHeading = 'Related records guides',
}: RecordsVaultTemplateProps) {
  return (
    <ContentTemplateShell
      meta={buildContentMeta({ primaryKeyword, description: metaDescription, path })}
      noIndex={noIndex}
      breadcrumbs={
        breadcrumbs ?? [
          { label: 'Home', href: ROUTES.LANDING },
          { label: 'Examples', href: '/examples' },
          { label: 'Vault', href: '/examples' },
          { label: h1 },
        ]
      }
      h1={h1}
      lead={lead}
      dataTitle="Vault page facts"
      dataRows={dataRows}
      dataLists={dataLists}
      body={body}
      cta={{
        variant: 'vault',
        headline: cta?.headline ?? 'Unlock the PetClues document vault (Pro)',
        subtext:
          cta?.subtext ??
          'Certificates, labs, and share links in one paywalled vault built for desks and ERs.',
        buttonText: cta?.buttonText ?? 'See Pro vault pricing',
        href: ctaHref,
      }}
      related={related ?? getVaultRelatedLinks()}
      relatedHeading={relatedHeading}
      faqs={faqs}
    />
  );
}

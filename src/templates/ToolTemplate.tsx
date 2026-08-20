import type { ReactNode } from 'react';
import type { ToolRecord } from '@content-types/tool';
import { TOOL_FAMILY_LABELS } from '@content-types/tool';
import { ROUTES } from '@/routes/paths';
import { ContentTemplateShell, type ContentFaq } from './shared/ContentTemplateShell';
import { buildContentMeta } from './shared/buildContentMeta';
import { getToolRelatedLinks } from './related/contentRelatedLinks';

export type ToolTemplateProps = {
  tool: ToolRecord;
  path: string;
  /** Example routes stay noIndex; production /tools pages set false. */
  noIndex?: boolean;
  unlockHref?: string;
  downloadHref?: string;
  /** Optional body override; defaults to tool.sections */
  body?: ReactNode;
  faqs?: ContentFaq[];
};

export function ToolTemplate({
  tool,
  path,
  noIndex = true,
  unlockHref = ROUTES.SIGNUP,
  downloadHref,
  body,
  faqs,
}: ToolTemplateProps) {
  const gated = tool.gated;
  const familyLabel = TOOL_FAMILY_LABELS[tool.family];

  const defaultBody = (
    <>
      {tool.sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph, i) => (
            <p key={`${section.heading}-${i}`}>{paragraph}</p>
          ))}
        </section>
      ))}
      {tool.NEEDS_VET_REVIEW ? (
        <p>
          <em>
            Editorial note: some fields on this template may need clinic confirmation for your region
            or pet. It is an organizer, not veterinary advice.
          </em>
        </p>
      ) : null}
    </>
  );

  return (
    <ContentTemplateShell
      meta={buildContentMeta({
        primaryKeyword: tool.primary_keyword,
        description: tool.meta_description,
        path,
      })}
      noIndex={noIndex}
      breadcrumbs={[
        { label: 'Home', href: ROUTES.LANDING },
        { label: 'Tools', href: '/tools' },
        { label: familyLabel, href: `/tools?family=${tool.family}` },
        { label: tool.h1 },
      ]}
      h1={tool.h1}
      lead={tool.lead}
      dataTitle="Checklist / tool facts"
      dataRows={[
        { label: 'Format', value: tool.format },
        { label: 'Includes', value: tool.includes },
        { label: 'Species', value: tool.species },
        { label: 'Use case', value: tool.use_case },
        { label: 'Gate', value: 'Free account unlock (trial funnel)' },
      ]}
      dataLists={[
        { heading: 'Rows in the download', items: tool.download_rows },
        { heading: 'How to use', items: tool.how_to_use },
      ]}
      body={body ?? defaultBody}
      cta={
        gated && !downloadHref
          ? {
              variant: 'trial',
              headline: 'Unlock this downloadable checklist',
              subtext:
                'Create a free account to get the printable file and save it beside your pet vault.',
              buttonText: 'Unlock checklist',
              href: unlockHref,
            }
          : {
              variant: 'trial',
              headline: 'Download your checklist',
              subtext: 'Keep a copy in PetClues so sitters and clinics see the same list.',
              buttonText: 'Download now',
              href: downloadHref ?? unlockHref,
            }
      }
      related={getToolRelatedLinks(tool)}
      relatedHeading="Related tools and guides"
      faqs={faqs ?? tool.faqs}
    />
  );
}

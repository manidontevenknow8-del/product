import type { ReactNode } from 'react';
import type { BreedRecord } from '@content-types/breed';
import type { LifeStageRecord } from '@content-types/life-stage';
import { ROUTES } from '@/routes/paths';
import { ContentTemplateShell, type ContentFaq } from './shared/ContentTemplateShell';
import { buildContentMeta } from './shared/buildContentMeta';
import { getBreedHealthRelated } from './related/contentRelatedLinks';

export type BreedHealthTemplateProps = {
  breed: BreedRecord;
  lifeStage: LifeStageRecord;
  path: string;
  primaryKeyword: string;
  metaDescription: string;
  body: ReactNode;
  faqs?: ContentFaq[];
  ctaHref?: string;
};

export function BreedHealthTemplate({
  breed,
  lifeStage,
  path,
  primaryKeyword,
  metaDescription,
  body,
  faqs,
  ctaHref = ROUTES.SIGNUP,
}: BreedHealthTemplateProps) {
  return (
    <ContentTemplateShell
      meta={buildContentMeta({ primaryKeyword, description: metaDescription, path })}
      noIndex={false}
      breadcrumbs={[
        { label: 'Home', href: ROUTES.LANDING },
        { label: 'Breeds', href: '/breeds' },
        { label: breed.name, href: `/breeds/${breed.slug}/adult-health-guide` },
        { label: `${lifeStage.stage} health guide` },
      ]}
      h1={`${breed.name} ${lifeStage.stage} health guide`}
      lead={`${breed.name} · ${lifeStage.name} · ${breed.species}`}
      dataTitle={`${breed.name} facts for this page`}
      dataRows={[
        { label: 'Species', value: breed.species },
        { label: 'Size', value: breed.size_category },
        { label: 'Avg weight', value: breed.avg_weight_range },
        { label: 'Avg lifespan', value: breed.avg_lifespan },
        { label: 'Life stage', value: lifeStage.name },
        { label: 'Typical age band', value: lifeStage.typical_age_range },
        { label: 'Grooming', value: breed.grooming_needs },
        { label: 'Temperament', value: breed.temperament_summary },
      ]}
      dataLists={[
        { heading: 'Common health issues (from breed record)', items: breed.common_health_issues },
        { heading: `${lifeStage.name} care checklist`, items: lifeStage.care_checklist },
      ]}
      body={body}
      cta={{
        variant: 'trial',
        headline: `Track ${breed.name} ${lifeStage.stage} care in one place`,
        subtext: 'Free trial for vaccine dates, weight notes, and shareable records.',
        buttonText: 'Start free trial',
        href: ctaHref,
      }}
      related={getBreedHealthRelated(breed, lifeStage)}
      relatedHeading="Related guides"
      faqs={faqs}
      medicalReview
    />
  );
}

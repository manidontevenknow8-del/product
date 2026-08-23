import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { BreedRecord } from '@content-types/breed';
import type { VaccinationPageScheduleEntry } from '@content-types/vaccination-page';
import { ROUTES } from '@/routes/paths';
import { ContentTemplateShell, type ContentFaq } from './shared/ContentTemplateShell';
import { buildContentMeta } from './shared/buildContentMeta';
import { getVaccinationScheduleRelated } from './related/contentRelatedLinks';

export type VaccinationScheduleSubject = {
  name: string;
  species: string;
  size_category?: string;
  avg_weight_range?: string;
  common_health_issues?: string[];
  core_vaccines_schedule: VaccinationPageScheduleEntry[];
};

export type VaccinationScheduleTemplateProps = {
  /** Breed pages pass a real breed record */
  breed?: BreedRecord;
  /** General pages pass a synthetic subject */
  subject?: VaccinationScheduleSubject;
  path: string;
  primaryKeyword: string;
  metaDescription: string;
  body: ReactNode;
  faqs?: ContentFaq[];
  ctaHref?: string;
  /** Injected into reminder CTA — specific vaccine/booster name */
  reminderVaccine: string;
  breedHealthHref?: string;
  breedHealthLabel?: string;
};

function resolveSubject(
  breed: BreedRecord | undefined,
  subject: VaccinationScheduleSubject | undefined,
): VaccinationScheduleSubject {
  if (breed) {
    return {
      name: breed.name,
      species: breed.species,
      size_category: breed.size_category,
      avg_weight_range: breed.avg_weight_range,
      common_health_issues: breed.common_health_issues,
      core_vaccines_schedule: breed.core_vaccines_schedule,
    };
  }
  if (subject) return subject;
  throw new Error('VaccinationScheduleTemplate requires breed or subject');
}

export function VaccinationScheduleTemplate({
  breed,
  subject: subjectProp,
  path,
  primaryKeyword,
  metaDescription,
  body,
  faqs,
  ctaHref = ROUTES.SIGNUP,
  reminderVaccine,
  breedHealthHref,
  breedHealthLabel,
}: VaccinationScheduleTemplateProps) {
  const subject = resolveSubject(breed, subjectProp);

  const scheduleRows = subject.core_vaccines_schedule.map((entry) => ({
    label: entry.age_label ?? `${entry.age_weeks} weeks`,
    value: entry.vaccine,
  }));

  const related = getVaccinationScheduleRelated(breed?.slug ?? null, path);

  const leadParts = [
    subject.size_category ? `${subject.size_category} ${subject.species}` : subject.species,
    subject.avg_weight_range ? subject.avg_weight_range : null,
  ].filter(Boolean);

  return (
    <ContentTemplateShell
      meta={buildContentMeta({ primaryKeyword, description: metaDescription, path })}
      breadcrumbs={[
        { label: 'Home', href: ROUTES.LANDING },
        { label: 'Vaccinations', href: '/vaccinations' },
        { label: subject.name },
      ]}
      h1={`${subject.name} vaccination schedule`}
      lead={`Core vaccine windows for ${subject.name}${leadParts.length ? ` (${leadParts.join(' · ')})` : ''}`}
      dataTitle="Core vaccine schedule (from record)"
      dataRows={[
        { label: 'Subject', value: subject.name },
        { label: 'Species', value: subject.species },
        ...(subject.size_category ? [{ label: 'Size', value: subject.size_category }] : []),
        ...(subject.avg_weight_range
          ? [{ label: 'Adult weight range', value: subject.avg_weight_range }]
          : []),
        ...scheduleRows,
      ]}
      dataLists={
        subject.common_health_issues && subject.common_health_issues.length > 0
          ? [
              {
                heading: 'Health issues to mention at vaccine visits',
                items: subject.common_health_issues,
              },
            ]
          : undefined
      }
      body={
        <>
          {body}
          {breedHealthHref ? (
            <p>
              Breed health context:{' '}
              <Link to={breedHealthHref}>{breedHealthLabel ?? `${subject.name} health guide`}</Link>
              .
            </p>
          ) : null}
        </>
      }
      cta={{
        variant: 'reminder',
        headline: `Never miss the ${reminderVaccine} booster — get a reminder 7, 3, and 1 day before it's due`,
        subtext: `PetClues keeps the ${subject.name} vaccine calendar honest so boarding desks and travel windows do not surprise you.`,
        buttonText: 'Turn on reminders',
        href: ctaHref,
      }}
      related={related}
      relatedHeading="Other vaccine schedules"
      faqs={faqs}
      medicalReview
    />
  );
}

import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { VaccinationScheduleTemplate } from '@/templates/VaccinationScheduleTemplate';
import { getBreedBySlug } from '@/content/loadContentData';
import type { VaccinationPageRecord } from '@content-types/vaccination-page';

const pageModules = import.meta.glob('@content-data/generated/vaccinations/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, VaccinationPageRecord>;

function loadPage(slug: string): VaccinationPageRecord | undefined {
  const entry = Object.entries(pageModules).find(([key]) => key.endsWith(`/${slug}.json`));
  return entry?.[1];
}

export function VaccinationSchedulePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const page = loadPage(slug);

  if (!page || page.slug.startsWith('_')) {
    return (
      <>
        <Header variant="landing" />
        <main style={{ padding: '2rem' }}>
          <p>Vaccination schedule not found.</p>
          <p>
            <Link to="/vaccinations">Browse all schedules</Link>
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const breed = page.breedSlug ? getBreedBySlug(page.breedSlug) : undefined;

  const body = (
    <>
      {page.bodySections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </section>
      ))}
    </>
  );

  if (page.kind === 'breed' && breed) {
    return (
      <>
        <Header variant="landing" />
        <VaccinationScheduleTemplate
          breed={breed}
          path={page.path}
          primaryKeyword={page.primaryKeyword}
          metaDescription={page.metaDescription}
          reminderVaccine={page.reminderVaccine}
          breedHealthHref={page.breedHealthHref}
          breedHealthLabel={page.breedHealthLabel}
          body={body}
          faqs={page.faqs}
        />
        <Footer />
      </>
    );
  }

  if (page.kind === 'general' && page.schedule) {
    return (
      <>
        <Header variant="landing" />
        <VaccinationScheduleTemplate
          subject={{
            name: page.subjectName,
            species: page.species === 'both' ? 'dog & cat' : page.species,
            size_category: page.size_category,
            avg_weight_range: page.avg_weight_range,
            common_health_issues: page.common_health_issues,
            core_vaccines_schedule: page.schedule,
          }}
          path={page.path}
          primaryKeyword={page.primaryKeyword}
          metaDescription={page.metaDescription}
          reminderVaccine={page.reminderVaccine}
          body={body}
          faqs={page.faqs}
        />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header variant="landing" />
      <main style={{ padding: '2rem' }}>
        <p>Incomplete vaccination page data for {slug}.</p>
      </main>
      <Footer />
    </>
  );
}

export default VaccinationSchedulePage;

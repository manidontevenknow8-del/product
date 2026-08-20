import { useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { VaccinationScheduleTemplate } from '@/templates/VaccinationScheduleTemplate';
import { getBreedBySlug } from '@/content/loadContentData';

export function ExampleVaccinationSchedulePage() {
  const { slug = 'labrador-retriever' } = useParams<{ slug: string }>();
  const breed = getBreedBySlug(slug) ?? getBreedBySlug('labrador-retriever');
  if (!breed) return <p>Missing breed sample.</p>;

  const path = `/examples/vaccination/${breed.slug}`;

  return (
    <>
      <Header variant="landing" />
      <VaccinationScheduleTemplate
        breed={breed}
        path={path}
        primaryKeyword={`${breed.name} vaccination schedule`}
        metaDescription={`${breed.name} vaccination schedule with core vaccine ages in weeks. Set PetClues reminders so boosters are not guessed.`}
        reminderVaccine={
          breed.core_vaccines_schedule.find((v) => /booster/i.test(v.vaccine))?.vaccine ??
          'core vaccine'
        }
        breedHealthHref={`/breeds/${breed.slug}/adult-health-guide`}
        breedHealthLabel={`${breed.name} adult health guide`}
        body={
          <>
            <h2>How to read the schedule</h2>
            <p>
              Ages are typical core windows from the breed record, aligned with AAHA/AAFP-style series
              timing. Your clinic sets the legal rabies label and any lifestyle vaccines.
            </p>
          </>
        }
        faqs={[
          {
            question: `At what age does the ${breed.name} core series usually finish?`,
            answer: `This sample schedule completes core vaccines around ${breed.core_vaccines_schedule.find((v) => v.age_weeks >= 16)?.age_weeks ?? 16} weeks, with rabies per local law.`,
          },
        ]}
      />
      <Footer />
    </>
  );
}

export default ExampleVaccinationSchedulePage;

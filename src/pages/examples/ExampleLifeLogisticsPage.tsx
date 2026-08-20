import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { LifeLogisticsTemplate } from '@/templates/LifeLogisticsTemplate';

const PATH = '/examples/life-logistics/pet-sitter-handoff';

export function ExampleLifeLogisticsPage() {
  return (
    <>
      <Header variant="landing" />
      <LifeLogisticsTemplate
        path={PATH}
        primaryKeyword="Pet sitter medical handoff checklist"
        metaDescription="Pet sitter medical handoff checklist for meds, vaccines, and emergency contacts. Start a free PetClues trial to share multi-pet profiles."
        h1="Pet sitter medical handoff checklist"
        lead="Moving, sitting, and multi-pet logistics example with shareable profiles."
        dataRows={[
          { label: 'Audience', value: 'Owners handing a pet to a sitter or co-parent' },
          { label: 'Must-have docs', value: 'Rabies, core vaccines, meds list, vet phone, feeding plan' },
          { label: 'Share method', value: 'Read-only multi-profile link preferred over camera-roll screenshots' },
          { label: 'Update cadence', value: 'Refresh before every boarding or overnight sit' },
        ]}
        dataLists={[
          {
            heading: 'Handoff steps',
            items: [
              'Confirm sitter can open the link on airplane mode',
              'Highlight dose times for the next 48 hours',
              'Name the emergency clinic and backup contact',
              'Note known allergies and food brand',
            ],
          },
        ]}
        body={
          <>
            <h2>Keep one packet per pet</h2>
            <p>
              Sitters fail when certificates live in three threads. Separate profiles plus one
              read-only share keep movers, sitters, and co-parents aligned.
            </p>
          </>
        }
        faqs={[
          {
            question: 'What should a sitter see first?',
            answer: 'Meds for the next two days, clinic phone, and any red-flag symptoms to call about.',
          },
        ]}
      />
      <Footer />
    </>
  );
}

export default ExampleLifeLogisticsPage;

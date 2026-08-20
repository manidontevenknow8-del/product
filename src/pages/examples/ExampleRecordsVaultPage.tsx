import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { RecordsVaultTemplate } from '@/templates/RecordsVaultTemplate';

const PATH = '/examples/vault/digital-pet-passport';

export function ExampleRecordsVaultPage() {
  return (
    <>
      <Header variant="landing" />
      <RecordsVaultTemplate
        path={PATH}
        primaryKeyword="Digital pet passport document vault"
        metaDescription="Digital pet passport document vault for vaccines, labs, and ER share links. Soft CTA: unlock PetClues Pro vault pricing."
        h1="Digital pet passport document vault"
        lead="Long-tail vault page example. Facts below are hand-authored for uniqueness."
        dataRows={[
          { label: 'Primary documents', value: 'Rabies certificate, core vaccines, microchip, allergy list' },
          { label: 'Share modes', value: 'Read-only link, PDF export, QR on collar tag' },
          { label: 'Pro gate', value: 'Full vault search + unlimited document storage (product framing)' },
          { label: 'Best for', value: 'Boarding desks, airline health certs, multi-sitter households' },
        ]}
        dataLists={[
          {
            heading: 'Packet checklist',
            items: [
              'Vaccine certificates with lot and expiration',
              'Current medication list with dose times',
              'Clinic and after-hours phone numbers',
              'Insurance card photo if applicable',
            ],
          },
        ]}
        body={
          <>
            <h2>Why vault pages stay light on JSON</h2>
            <p>
              These URLs are mostly hand-authored long-tail. The scannable table is still required so
              two vault pages do not collapse into identical prose.
            </p>
          </>
        }
        faqs={[
          {
            question: 'Is the document vault free?',
            answer: 'This template pitches Pro for the full vault. Trial CTAs live on other pillars.',
          },
        ]}
      />
      <Footer />
    </>
  );
}

export default ExampleRecordsVaultPage;

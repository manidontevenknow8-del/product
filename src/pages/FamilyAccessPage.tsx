import { useState } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageContainer, SectionHeader, Button, LoadingState } from '@/components/ui';
import {
  InviteCaretakerModal,
  CaretakerCard,
  SharedPetsList,
  FutureAccessPlaceholder,
} from '@/components/family-sharing';
import { useFamilySharing } from '@/familySharing';
import styles from './FamilyAccessPage.module.css';

export function FamilyAccessPage() {
  const {
    sharedPets,
    caretakers,
    isLoading,
    inviteCaretaker,
    updatePermission,
    removeCaretaker,
    resendInvitation,
  } = useFamilySharing();
  const [inviteOpen, setInviteOpen] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <PageContainer size="lg">
          <LoadingState message="Loading family access" />
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer size="lg" className={styles.page}>
        <SectionHeader
          title="Family & shared care"
          subtitle="Invite people you trust to help care for your pets - partners, family, or pet sitters."
        />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shared pets</h2>
          <p className={styles.sectionDesc}>
            Pets currently available for caretaker access.
          </p>
          <SharedPetsList pets={sharedPets} />
        </section>

        <section className={styles.section}>
          <div className={styles.headerRow}>
            <div>
              <h2 className={styles.sectionTitle}>Caretakers</h2>
              <p className={styles.sectionDesc}>
                Manage who can view and help with your pet&apos;s care.
              </p>
            </div>
            <Button variant="primary" onClick={() => setInviteOpen(true)}>
              Invite caretaker
            </Button>
          </div>

          <div className={styles.caretakers}>
            {caretakers.map((caretaker) => (
              <CaretakerCard
                key={caretaker.id}
                caretaker={caretaker}
                sharedPets={sharedPets}
                onUpdatePermission={(permission) =>
                  updatePermission(caretaker.id, permission)
                }
                onRemove={() => removeCaretaker(caretaker.id)}
                onResend={
                  caretaker.status === 'pending'
                    ? () => resendInvitation(caretaker.id)
                    : undefined
                }
              />
            ))}
          </div>
        </section>

        <FutureAccessPlaceholder />

        <InviteCaretakerModal
          isOpen={inviteOpen}
          sharedPets={sharedPets}
          onClose={() => setInviteOpen(false)}
          onSubmit={async (input) => {
            await inviteCaretaker(input);
          }}
        />
      </PageContainer>
    </AppLayout>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { PageContainer, Badge, Button, SectionHeader } from '@/components/ui';
import {
  ActivateLostPetModal,
  RecoveryStatusCard,
  LastSeenCard,
  FutureIntegrationsPlaceholder,
} from '@/components/lost-pet';
import {
  LostPetPoster,
  ShareEmergencyCard,
  EmergencyQRCode,
  ContactOwnerCard,
} from '@/components/lost-pet/sharing';
import {
  NearbySightingsFeed,
  ReportSightingModal,
} from '@/components/lost-pet/community';
import { useLostPet } from '@/lostPet';
import { formatMissingSince } from '@/utils/lostPetUtils';
import { usePets } from '@/pets';
import { PetSwitcher } from '@/components/pets';
import { ROUTES } from '@/routes/paths';
import styles from './LostPetPage.module.css';

export function LostPetPage() {
  const { activePet, pets, setActivePet } = usePets();
  const petName = activePet?.name ?? 'your pet';
  const {
    activeCase,
    isActive,
    recoveryStats,
    sightings,
    emergencyContacts,
    activate,
    resolve,
    reportSighting,
    markSightingReviewed,
  } = useLostPet();

  const [activateOpen, setActivateOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [missingSince, setMissingSince] = useState('');

  useEffect(() => {
    if (!activeCase) return;
    const update = () => setMissingSince(formatMissingSince(activeCase.activatedAt));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [activeCase]);

  const handleActivate = async (input: Parameters<typeof activate>[0]) => {
    await activate(input);
  };

  if (!isActive || !activeCase || !recoveryStats) {
    return (
      <AppLayout>
        <PageContainer size="md">
          <SectionHeader
            title="Lost Pet Mode"
            subtitle="Emergency recovery when you need it most"
          />

          {activePet && (
            <PetSwitcher
              pets={pets}
              activeId={activePet.id}
              onSelect={setActivePet}
              variant="light"
              className={styles.petSwitcher}
            />
          )}

          <div className={styles.inactiveHero}>
            <Badge variant="accent" className={styles.inactiveEyebrow}>
              Emergency feature
            </Badge>
            <h2 className={styles.inactiveTitle}>
              If {petName} goes missing, PetClues has your back
            </h2>
            <p className={styles.inactiveText}>
              Activate Lost Pet Mode to generate recovery assets, share with your
              community, and track sightings - calmly, clearly, and without the
              noise of social media.
            </p>

            <ul className={styles.trustList}>
              <li className={styles.trustItem}>
                <strong>Recovery poster</strong>
                Print-ready missing pet poster with your contact details
              </li>
              <li className={styles.trustItem}>
                <strong>QR recovery link</strong>
                One scan to view details and report a sighting
              </li>
              <li className={styles.trustItem}>
                <strong>Sighting reports</strong>
                Structured community reports - not a social feed
              </li>
            </ul>

            <Button variant="destructive" size="lg" onClick={() => setActivateOpen(true)}>
              Activate Lost Pet Mode
            </Button>

            <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-light)' }}>
              Also available from{' '}
              <Link to={ROUTES.EMERGENCY_PASSPORT}>Emergency Passport</Link>
            </p>
          </div>

          <FutureIntegrationsPlaceholder />
        </PageContainer>

        <ActivateLostPetModal
          isOpen={activateOpen}
          onClose={() => setActivateOpen(false)}
          onActivate={handleActivate}
          petName={petName}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer size="xl" className={styles.page}>
        <header className={styles.emergencyHeader}>
          <div className={styles.emergencyPhoto}>{activeCase.avatarInitials}</div>
          <div className={styles.emergencyInfo}>
            <span className={styles.emergencyLabel}>Missing</span>
            <h1 className={styles.emergencyName}>{activeCase.petName}</h1>
            <p className={styles.emergencyMeta}>
              {activeCase.breed} · Missing for{' '}
              <span className={styles.emergencyTimer}>{missingSince}</span>
            </p>
          </div>
          <div className={styles.emergencyActions}>
            <Button variant="primary" size="sm" onClick={() => setReportOpen(true)}>
              Log sighting
            </Button>
            <Button variant="ghost" size="sm" onClick={resolve} className={styles.foundBtn}>
              Mark as found
            </Button>
          </div>
        </header>

        <RecoveryStatusCard activeCase={activeCase} stats={recoveryStats} />

        <div className={styles.grid}>
          <div className={styles.column}>
            <LastSeenCard activeCase={activeCase} />
            <ContactOwnerCard contacts={emergencyContacts} />
            <NearbySightingsFeed
              sightings={sightings}
              onMarkReviewed={markSightingReviewed}
              onReportSighting={() => setReportOpen(true)}
            />
          </div>

          <div className={styles.column}>
            <h2 className={styles.sectionTitle}>Recovery assets</h2>
            <LostPetPoster
              activeCase={activeCase}
              primaryContact={emergencyContacts[0]}
            />
            <ShareEmergencyCard activeCase={activeCase} />
            <EmergencyQRCode activeCase={activeCase} />
          </div>
        </div>

        <FutureIntegrationsPlaceholder />
      </PageContainer>

      <ReportSightingModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={reportSighting}
        petName={activeCase.petName}
      />

      <ActivateLostPetModal
        isOpen={activateOpen}
        onClose={() => setActivateOpen(false)}
        onActivate={handleActivate}
        petName={petName}
      />
    </AppLayout>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Avatar, Badge, Button, LoadingState } from '@/components/ui';
import { UpgradeModal } from '@/components/subscription';
import { useAuth } from '@/auth/AuthProvider';
import { canCreateHealthRecord } from '@/subscription/featureGates';
import {
  PetSummaryCard,
  PetDetailsGrid,
  PetHealthRecords,
  PetMedicalHistory,
  PetDocumentsVault,
  EditProfileModal,
  HealthRecordModal,
} from '@/components/pet-profile';
import { AddAnotherPetButton, PetSwitcherHero } from '@/components/pets';
import { EmptyPetProfileState } from '@/components/empty-states';
import { HealthDisclaimerNote } from '@/components/trust/HealthDisclaimerNote';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { petRecordToPetProfile, type UpdatePetInput } from '@/services/pets/petService';
import type { HealthRecord } from '@/services/healthRecords/healthRecordService';
import type { CreateHealthRecordInput } from '@/services/healthRecords/healthRecordService';
import type { ProfileStatus } from '@/types/profile';
import { ROUTES } from '@/routes/paths';
import styles from './PetProfilePage.module.css';

const IMG = {
  hero: '/images/profile/profile-hero.png',
  health: '/images/profile/profile-health.png',
  vault: '/images/profile/profile-vault.png',
} as const;

const speciesLabel: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
};

const HOW_PROFILE_WORKS = [
  {
    step: '1',
    title: 'Your pet’s identity',
    body: 'Name, breed, age, photo, diet, microchip, and care notes live here - the source of truth that powers your dashboard, reminders, and timeline.',
  },
  {
    step: '2',
    title: 'Medical history on record',
    body: 'Add vaccinations, vet visits, medications, diagnoses, and weight checks. Records roll into summaries, medical timeline, and can seed reminders.',
  },
  {
    step: '3',
    title: 'Vault & connected tools',
    body: 'Upload bills, prescriptions, and reports to the document vault. PetCare Score, daily check-ins, and monthly reports all draw from this profile.',
  },
] as const;

const PROFILE_PILLARS = [
  {
    title: 'Health records',
    body: 'Structured entries grouped by type - vaccines, wellness, meds, and more - with a chronological medical history below.',
    image: IMG.health,
    alt: 'Illustration of pet vaccination and vet visit records',
  },
  {
    title: 'Document vault',
    body: 'Store scans and PDFs per pet so prescriptions, lab reports, and emergency papers are one tap away.',
    image: IMG.vault,
    alt: 'Illustration of organized pet care documents in a vault',
  },
] as const;

function deriveProfileStatus(recordCount: number): ProfileStatus {
  if (recordCount === 0) {
    return { label: 'No records yet', variant: 'default' };
  }
  if (recordCount >= 3) {
    return { label: 'Records current', variant: 'success' };
  }
  return { label: 'Building history', variant: 'accent' };
}

export function PetProfilePage() {
  const { user } = useAuth();
  const { activePet, pets, setActivePet, isLoading, hasPets, updatePet } = usePets();
  const { healthSummary, createRecord, updateRecord, deleteRecord } = useHealthRecords();
  const [editOpen, setEditOpen] = useState(false);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [healthUpgradeOpen, setHealthUpgradeOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  const profile = activePet ? petRecordToPetProfile(activePet) : null;
  const profileStatus = deriveProfileStatus(healthSummary.recordCount);

  const accessInput = {
    subscriptionStatus: user?.subscriptionStatus,
    subscriptionTier: user?.subscriptionTier ?? 'free',
  };

  const openAddRecord = () => {
    if (!canCreateHealthRecord(accessInput, healthSummary.recordCount)) {
      setHealthUpgradeOpen(true);
      return;
    }
    setEditingRecord(null);
    setHealthModalOpen(true);
  };

  const openEditRecord = (record: HealthRecord) => {
    setEditingRecord(record);
    setHealthModalOpen(true);
  };

  const handleHealthSubmit = async (input: CreateHealthRecordInput, recordId?: string) => {
    if (recordId) {
      await updateRecord(recordId, input);
    } else {
      await createRecord(input);
    }
  };

  const handleSave = async (input: UpdatePetInput) => {
    if (!activePet) return;
    await updatePet(activePet.id, input);
  };

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <header className={styles.hero}>
            <img className={styles.heroBg} src={IMG.hero} alt="" aria-hidden />
            <div className={styles.heroScrim} aria-hidden />
          </header>
          <div className={styles.body}>
            <LoadingState message="Loading pet profile" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasPets || !profile || !activePet) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <header className={styles.hero}>
            <img className={styles.heroBg} src={IMG.hero} alt="" aria-hidden />
            <div className={styles.heroScrim} aria-hidden />
            <div className={styles.heroInner}>
              <p className={styles.heroEyebrow}>Pet profile</p>
              <h1 className={styles.heroTitle}>Your pet’s home base</h1>
              <p className={styles.heroLead}>
                Add a pet to unlock their health vault, care records, document storage, and
                personalized insights across PetClues.
              </p>
            </div>
          </header>
          <div className={styles.body}>
            <EmptyPetProfileState />
          </div>
        </div>
      </AppLayout>
    );
  }

  const meta = [profile.breed, speciesLabel[profile.species], profile.age]
    .filter(Boolean)
    .join(' · ');
  const heroPhoto = profile.photo;

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <header className={styles.hero}>
          {heroPhoto ? (
            <img className={styles.heroBg} src={heroPhoto} alt="" aria-hidden />
          ) : (
            <img className={styles.heroBg} src={IMG.hero} alt="" aria-hidden />
          )}
          <div className={styles.heroScrim} aria-hidden />

          <PetSwitcherHero pets={pets} activeId={activePet.id} onSelect={setActivePet} />

          <div className={styles.heroInner}>
            <div className={styles.heroIdentityRow}>
              <div className={styles.heroAvatar}>
                {heroPhoto ? (
                  <img src={heroPhoto} alt={profile.name} className={styles.heroAvatarImg} />
                ) : (
                  <Avatar initials={profile.avatarInitials} size="xl" />
                )}
              </div>
              <div className={styles.heroText}>
                <p className={styles.heroEyebrow}>Pet vault · {speciesLabel[profile.species]}</p>
                <h1 className={styles.heroTitle}>{profile.name}</h1>
                {meta && <p className={styles.heroMeta}>{meta}</p>}
                <div className={styles.heroBadges}>
                  <Badge variant={profileStatus.variant}>{profileStatus.label}</Badge>
                  <Badge variant="default">{healthSummary.recordCount} health records</Badge>
                </div>
              </div>
            </div>
            <div className={styles.heroActions}>
              <Button variant="primary" size="md" onClick={() => setEditOpen(true)}>
                Edit profile
              </Button>
              <Button
                variant="secondary"
                size="md"
                className={styles.heroLightBtn}
                onClick={openAddRecord}
              >
                Add health record
              </Button>
              <AddAnotherPetButton size="md" className={styles.heroLightBtn} />
            </div>
          </div>
        </header>

        <div className={styles.body}>
          <section className={styles.section} aria-labelledby="profile-how-heading">
            <h2 id="profile-how-heading" className={styles.sectionTitle}>
              What your pet profile does
            </h2>
            <p className={styles.sectionLead}>
              This is not just a photo and name - it is the hub that keeps {profile.name}&apos;s care
              organized, searchable, and connected to everything else in PetClues.
            </p>
            <div className={styles.steps}>
              {HOW_PROFILE_WORKS.map((item) => (
                <article key={item.step} className={styles.stepCard}>
                  <span className={styles.stepNum}>{item.step}</span>
                  <h3 className={styles.stepTitle}>{item.title}</h3>
                  <p className={styles.stepBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.bento} aria-labelledby="profile-pillars-heading">
            <h2 id="profile-pillars-heading" className={styles.visuallyHidden}>
              Profile pillars
            </h2>
            {PROFILE_PILLARS.map((item) => (
              <article key={item.title} className={styles.pillarCard}>
                <div className={styles.pillarMedia}>
                  <img src={item.image} alt={item.alt} className={styles.pillarImg} loading="lazy" />
                </div>
                <div className={styles.pillarCopy}>
                  <h3 className={styles.pillarTitle}>{item.title}</h3>
                  <p className={styles.pillarBody}>{item.body}</p>
                </div>
              </article>
            ))}
          </section>

          <section className={styles.tools} aria-labelledby="profile-tools-heading">
            <h2 id="profile-tools-heading" className={styles.sectionTitle}>
              Tools powered by this profile
            </h2>
            <div className={styles.toolGrid}>
              <article className={styles.toolCard}>
                <h3 className={styles.toolTitle}>PetCare Score</h3>
                <p className={styles.toolBody}>
                  See how well {profile.name}&apos;s care is organized - profile completeness,
                  reminders, records, and documents feed the score.
                </p>
                <Link to={ROUTES.PET_CARE_SCORE}>
                  <Button variant="primary" size="sm">
                    View score
                  </Button>
                </Link>
              </article>

              <article className={styles.toolCard}>
                <h3 className={styles.toolTitle}>Daily check-in</h3>
                <p className={styles.toolBody}>
                  Log what {profile.name} ate and how far you walked today - builds streaks and
                  monthly stories.
                </p>
                <Link to={ROUTES.DASHBOARD}>
                  <Button variant="primary" size="sm">
                    Log today
                  </Button>
                </Link>
              </article>

              <article className={styles.toolCard}>
                <h3 className={styles.toolTitle}>Monthly report</h3>
                <p className={styles.toolBody}>
                  Shareable visual recap of care activity, check-ins, and milestones each month.
                </p>
                <Link to={ROUTES.MONTHLY_REPORT}>
                  <Button variant="secondary" size="sm">
                    View report
                  </Button>
                </Link>
              </article>
            </div>
          </section>

          <section className={styles.workspace} aria-labelledby="profile-data-heading">
            <h2 id="profile-data-heading" className={styles.sectionTitle}>
              {profile.name}&apos;s records & details
            </h2>
            <p className={styles.workspaceLead}>
              Edit basics anytime, add health events, and upload documents - all scoped to this pet.
            </p>

            <div className={styles.dataGrid}>
              <div className={styles.dataCol}>
                <PetSummaryCard profile={profile} />
                <PetDetailsGrid profile={profile} />
                <PetDocumentsVault />
              </div>
              <div className={styles.dataCol}>
                <PetMedicalHistory onAdd={openAddRecord} />
                <PetHealthRecords onAdd={openAddRecord} onEdit={openEditRecord} />
              </div>
            </div>
          </section>

          <HealthDisclaimerNote />
        </div>
      </div>

      <EditProfileModal
        pet={activePet}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />

      <HealthRecordModal
        record={editingRecord}
        isOpen={healthModalOpen}
        onClose={() => {
          setHealthModalOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleHealthSubmit}
        onDelete={editingRecord ? deleteRecord : undefined}
      />

      <UpgradeModal
        isOpen={healthUpgradeOpen}
        onClose={() => setHealthUpgradeOpen(false)}
      />
    </AppLayout>
  );
}

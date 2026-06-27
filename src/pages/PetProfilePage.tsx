import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState, EditorialUpgradeModal } from '@/components/ui';
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
import { EmptyPetProfileState } from '@/components/empty-states';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { usePetCareScore } from '@/petCareScore';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { petRecordToPetProfile, type UpdatePetInput } from '@/services/pets/petService';
import { resolvePetHeroBackground } from '@/services/pets/petHeroImage';
import { getAvatarInitials } from '@/services/pets/petUtils';
import type { HealthRecord } from '@/services/healthRecords/healthRecordService';
import type { CreateHealthRecordInput } from '@/services/healthRecords/healthRecordService';
import type { ProfileStatus } from '@/types/profile';
import type { PetRecord } from '@/services/pets/petTypes';
import { ROUTES } from '@/routes/paths';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { PAGE_IMG } from '@/data/pageImages';
import styles from './PetProfilePage.module.css';

const speciesLabel: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
};

const HOW_PROFILE_WORKS = [
  {
    step: '01',
    title: "Your pet's identity",
    body: 'Name, breed, age, photo, diet, microchip, and care notes — the source of truth that powers your dashboard, reminders, and timeline.',
  },
  {
    step: '02',
    title: 'Medical history on record',
    body: 'Add vaccinations, vet visits, medications, diagnoses, and weight checks. Records roll into summaries, medical timeline, and can seed reminders.',
  },
  {
    step: '03',
    title: 'Vault & connected tools',
    body: 'Upload bills, prescriptions, and reports to the document vault. PetCare Score, daily check-ins, and monthly reports all draw from this profile.',
  },
] as const;

const ROMAN_NUMERALS: Record<string, string> = {
  '01': 'I',
  '02': 'II',
  '03': 'III',
};

function ProfileSectionIntro({
  chapter,
  title,
  lead,
  titleId,
}: {
  chapter: string;
  title: string;
  lead?: string;
  titleId?: string;
}) {
  return (
    <header className={styles.chapterIntro}>
      <p className={styles.sectionKicker}>{chapter}</p>
      <h2 id={titleId} className={styles.sectionTitle}>
        {title}
      </h2>
      {lead && <p className={styles.sectionLead}>{lead}</p>}
    </header>
  );
}

function ArchiveConnections({
  petName,
  score,
}: {
  petName: string;
  score: number | null;
}) {
  return (
    <nav className={styles.connectionsBand} data-reveal aria-label="Archive connections">
      <Link to={ROUTES.PET_CARE_SCORE} className={styles.connectionLink}>
        <span className={styles.connectionLabel}>PetCare Score</span>
        <span className={styles.connectionValue}>
          {score != null ? `${score} · View breakdown` : 'View score'}
        </span>
      </Link>
      <span className={styles.connectionRule} aria-hidden />
      <Link to={ROUTES.DASHBOARD} className={styles.connectionLink}>
        <span className={styles.connectionLabel}>Daily check-in</span>
        <span className={styles.connectionValue}>Log today for {petName}</span>
      </Link>
      <span className={styles.connectionRule} aria-hidden />
      <Link to={ROUTES.MONTHLY_REPORT} className={styles.connectionLink}>
        <span className={styles.connectionLabel}>Monthly report</span>
        <span className={styles.connectionValue}>Shareable care recap</span>
      </Link>
    </nav>
  );
}

function deriveProfileStatus(recordCount: number): ProfileStatus {
  if (recordCount === 0) {
    return { label: 'No records yet', variant: 'default' };
  }
  if (recordCount >= 3) {
    return { label: 'Records current', variant: 'success' };
  }
  return { label: 'Building history', variant: 'accent' };
}

function PetStack({
  pets,
  activeId,
  onSelect,
}: {
  pets: PetRecord[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (pets.length <= 1) return null;

  return (
    <div className={styles.petStack} role="tablist" aria-label="Switch pet">
      {pets.map((pet, index) => (
        <button
          key={pet.id}
          type="button"
          role="tab"
          aria-selected={pet.id === activeId}
          aria-label={pet.name}
          title={pet.name}
          style={{ zIndex: index + 1 }}
          onClick={() => onSelect(pet.id)}
          className={`${styles.petStackBtn} ${pet.id === activeId ? styles.petStackBtnActive : ''}`}
        >
          <span className={styles.petStackBtnInner}>
            {pet.photoUrl ? (
              <img src={pet.photoUrl} alt="" className={styles.petStackImg} />
            ) : (
              <span className={styles.petStackInitials}>{getAvatarInitials(pet.name)}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

function AddPetGhostButton() {
  const navigate = useNavigate();
  const { pets } = usePets();
  const petAccess = useFeatureAccess('pets');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (pets.length === 0) return null;

  const handleClick = () => {
    if (petAccess.isAllowed) {
      navigate(`${ROUTES.ONBOARDING}?add=true`);
      return;
    }
    setUpgradeOpen(true);
  };

  return (
    <>
      <button type="button" className={styles.btnGhost} onClick={handleClick}>
        Add another pet
      </button>
      <EditorialUpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        eyebrow="PetClues Plus"
        title="Your family is growing"
        description="Upgrade to Plus to manage up to 3 pets and unlock unlimited care history."
        requiredTier="Plus"
      />
    </>
  );
}

export function PetProfilePage() {
  const { user } = useAuth();
  const { activePet, pets, setActivePet, isLoading, hasPets, updatePet } = usePets();
  const { healthSummary, createRecord, updateRecord, deleteRecord } = useHealthRecords();
  const { data: scoreData } = usePetCareScore();
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
            <img className={styles.heroBg} src={PAGE_IMG.app.hero} alt="" aria-hidden />
            <div className={styles.heroWash} aria-hidden />
            <div className={styles.heroFade} aria-hidden />
            <div className={styles.heroTexture} aria-hidden />
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
          <div className={styles.heroWrap}>
            <header className={styles.hero}>
              <img className={styles.heroBg} src={PAGE_IMG.app.hero} alt="" aria-hidden />
              <div className={styles.heroWash} aria-hidden />
              <div className={styles.heroFade} aria-hidden />
              <div className={styles.heroTexture} aria-hidden />
              <div className={styles.heroInner}>
                <p className={styles.heroEyebrow}>Pet vault</p>
                <h1 className={styles.heroTitle}>Your pet's home base</h1>
                <p className={styles.heroLead}>
                  Add a pet to unlock their health vault, care records, document storage, and
                  personalized insights across PetClues.
                </p>
              </div>
            </header>
          </div>
          <div className={styles.body}>
            <EmptyPetProfileState />
          </div>
        </div>
      </AppLayout>
    );
  }

  const meta = [speciesLabel[profile.species], profile.age].filter(Boolean).join(' · ');
  const recordCountLabel = `${healthSummary.recordCount} health record${healthSummary.recordCount === 1 ? '' : 's'}`;
  const heroBackground = resolvePetHeroBackground(activePet.photoUrl);

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <div className={styles.heroWrap}>
          <header className={styles.hero}>
            <img
              className={`${styles.heroBg} ${heroBackground.isPetPhoto ? styles.heroBgPet : ''}`}
              src={heroBackground.src}
              alt=""
              aria-hidden
            />
            <div className={styles.heroWash} aria-hidden />
            <div className={styles.heroFade} aria-hidden />
            <div className={styles.heroTexture} aria-hidden />
            <div className={styles.heroInner}>
              <div className={styles.heroTopRow}>
                <PetStack pets={pets} activeId={activePet.id} onSelect={setActivePet} />
              </div>

              <div className={styles.heroCoverGrid}>
                <div className={styles.heroCoverText}>
                  <p className={styles.heroEyebrow}>Pet archive · {speciesLabel[profile.species]}</p>
                  <h1 className={styles.heroTitle}>{profile.name}</h1>
                  {meta && <p className={styles.heroMeta}>{meta}</p>}
                  <div className={styles.heroTags}>
                    <span className={styles.statusSeal}>{profileStatus.label}</span>
                    <span className={styles.statusSealMuted}>{recordCountLabel}</span>
                  </div>
                  <div className={styles.heroCtaRow}>
                    <button type="button" className={styles.btnGold} onClick={openAddRecord}>
                      Add health record
                    </button>
                    <button type="button" className={styles.btnGhost} onClick={() => setEditOpen(true)}>
                      Edit profile
                    </button>
                    <AddPetGhostButton />
                  </div>
                </div>

                {(profile.photo || heroBackground.isPetPhoto) && (
                  <div className={styles.heroPortraitFrame} aria-hidden>
                    <img
                      src={profile.photo ?? heroBackground.src}
                      alt=""
                      className={styles.heroPortraitImg}
                    />
                  </div>
                )}
              </div>
            </div>
          </header>
        </div>

        <section className={styles.manifestoBleed} data-reveal aria-labelledby="source-of-truth">
          <div className={styles.manifestoInner}>
            <p className={styles.manifestoKicker}>Manifesto</p>
            <h2 id="source-of-truth" className={styles.manifestoTitle}>
              The source of truth
            </h2>
            <p className={styles.manifestoLead}>
              {profile.name}'s complete identity — a private archive that every reminder, insight, and
              timeline moment draws from. Preserved with care, kept current with intention.
            </p>
            <div className={styles.truthStrip}>
              {HOW_PROFILE_WORKS.map((item) => (
                <article key={item.step} className={styles.truthCol}>
                  <span className={styles.truthGhostNum} aria-hidden>
                    {ROMAN_NUMERALS[item.step]}
                  </span>
                  <span className={styles.truthStepLabel}>{ROMAN_NUMERALS[item.step]}</span>
                  <h3 className={styles.truthTitle}>{item.title}</h3>
                  <p className={styles.truthBody}>{item.body}</p>
                </article>
              ))}
            </div>
            <ArchiveConnections
              petName={profile.name}
              score={scoreData?.snapshot.score ?? null}
            />
          </div>
        </section>

        <div className={styles.body}>
          <section className={styles.chapter} data-reveal aria-labelledby="chapter-identity">
            <ProfileSectionIntro
              titleId="chapter-identity"
              chapter="Chapter I · Identity"
              title={`Who ${profile.name} is`}
              lead="The foundational details — breed, age, diet, and the notes that define your pet at a glance."
            />
            <div className={styles.identitySpread}>
              <div className={styles.identityPrimary}>
                <PetDetailsGrid profile={profile} showHeader={false} />
              </div>
              <aside className={styles.identityAside} aria-label="At a glance">
                <PetSummaryCard profile={profile} showHeader={false} />
              </aside>
            </div>
          </section>

          <section className={styles.chapter} data-reveal aria-labelledby="chapter-medical">
            <ProfileSectionIntro
              titleId="chapter-medical"
              chapter="Chapter II · Medical archive"
              title="Health & history"
              lead="A chronological narrative of care events, preserved as both timeline and dossier."
            />
            <div className={styles.medicalArchive}>
              <div className={styles.medicalTimeline}>
                <PetMedicalHistory
                  onAdd={openAddRecord}
                  onEdit={openEditRecord}
                  showHeader={false}
                />
              </div>
              <div className={styles.medicalDossier}>
                <div className={styles.dossierHeader}>
                  <p className={styles.dossierKicker}>By category</p>
                  <button type="button" className={styles.dossierAddBtn} onClick={openAddRecord}>
                    Add record
                  </button>
                </div>
                <PetHealthRecords
                  onAdd={openAddRecord}
                  onEdit={openEditRecord}
                  showHeader={false}
                />
              </div>
            </div>
          </section>

          <section className={styles.chapter} data-reveal aria-labelledby="chapter-vault">
            <ProfileSectionIntro
              titleId="chapter-vault"
              chapter="Chapter III · Vault"
              title="Document archive"
              lead="Prescriptions, lab reports, and emergency papers — curated, encrypted, and always within reach."
            />
            <div className={styles.vaultChapter}>
              <PetDocumentsVault showHeader={false} />
            </div>
          </section>

          <footer className={styles.legalFooter}>
            <hr className={styles.legalRule} />
            <p className={styles.legalText} role="note">
              {HEALTH_DISCLAIMER}
            </p>
          </footer>
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

      <UpgradeModal isOpen={healthUpgradeOpen} onClose={() => setHealthUpgradeOpen(false)} />
    </AppLayout>
  );
}

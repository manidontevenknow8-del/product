import { AppLayout } from '@/layouts/AppLayout';
import { PageContainer, SectionHeader } from '@/components/ui';
import {
  AgeInputCard,
  AgeCalculationCard,
  HumanEquivalentCard,
  LifeStageCard,
  FutureAgeIntelligence,
} from '@/components/age-translator';
import {
  LifeStageInsights,
  BreedSpecificInsights,
  HealthFocusCard,
  UpcomingMilestones,
} from '@/components/age-translator/insights';
import {
  AgeShareCard,
  SharePreviewCard,
  DownloadStoryCard,
} from '@/components/age-translator/sharing';
import { useAgeTranslator } from '@/ageTranslator';
import styles from './PetAgeTranslatorPage.module.css';

export function PetAgeTranslatorPage() {
  const {
    pets,
    selectedPet,
    translation,
    lifeStageInsight,
    breedInsights,
    healthFocus,
    milestones,
    isLoading,
    selectPet,
  } = useAgeTranslator();

  if (isLoading && !translation) {
    return (
      <AppLayout>
        <PageContainer size="xl">
          <p className={styles.loading}>Translating…</p>
        </PageContainer>
      </AppLayout>
    );
  }

  if (!selectedPet || !translation || !lifeStageInsight) {
    return (
      <AppLayout>
        <PageContainer size="md">
          <SectionHeader title="Pet Age Translator" subtitle="Add a pet to get started" />
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer size="xl" className={styles.page}>
        <SectionHeader
          title="Pet Age Translator"
          subtitle="Discover your companion's life stage - and share the magic"
        />

        <div className={styles.heroGrid}>
          <AgeInputCard
            pets={pets}
            selectedId={selectedPet.id}
            onSelect={selectPet}
          />
          <AgeCalculationCard pet={selectedPet} translation={translation} />
        </div>

        <div className={styles.ageGrid}>
          <HumanEquivalentCard petName={selectedPet.name} translation={translation} />
          <LifeStageCard translation={translation} insight={lifeStageInsight} />
        </div>

        <LifeStageInsights insight={lifeStageInsight} />

        <div className={styles.insightsGrid}>
          <BreedSpecificInsights insights={breedInsights} breed={selectedPet.breed} />
          <HealthFocusCard items={healthFocus} />
        </div>

        <UpcomingMilestones milestones={milestones} />

        <section className={styles.shareSection}>
          <h2 className={styles.shareTitle}>Share the story</h2>
          <p className={styles.shareSubtitle}>
            {translation.shareMessage} Spread the word - and invite friends to discover PetClues.
          </p>
          <div className={styles.shareGrid}>
            <AgeShareCard pet={selectedPet} translation={translation} />
            <SharePreviewCard pet={selectedPet} translation={translation} />
            <DownloadStoryCard petName={selectedPet.name} />
          </div>
        </section>

        <FutureAgeIntelligence />
      </PageContainer>
    </AppLayout>
  );
}

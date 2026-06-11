import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { useAnalytics } from '@/analytics';
import { EditorialUpgradeModal } from '@/components/ui';
import { consumePendingPetMatch } from '@/data/petMatchStorage';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import {
  emptyOnboardingData,
  ONBOARDING_STEPS,
  type OnboardingPetData,
  type OnboardingStepId,
} from '@/types/onboarding';
import { ROUTES } from '@/routes/paths';
import { OnboardingNavigation } from './OnboardingNavigation';
import { OnboardingProgress } from './OnboardingProgress';
import {
  AgeStep,
  NameStep,
  PortraitStep,
  SpeciesStep,
} from './OnboardingEditorialSteps';
import shell from './OnboardingEditorial.module.css';
import limitStyles from './OnboardingPetLimit.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1800&q=80';

const STEP_ORDER: OnboardingStepId[] = ['portrait', 'name', 'species', 'age'];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAddPetMode = searchParams.get('add') === 'true';
  const petAccess = useFeatureAccess('pets');
  const { completeOnboarding, user } = useAuth();
  const { createPetFromOnboarding } = usePets();
  const { track } = useAnalytics();
  const [step, setStep] = useState<OnboardingStepId>('portrait');
  const [data, setData] = useState<OnboardingPetData>(emptyOnboardingData);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const onboardingStarted = useRef(false);
  const pendingMatchApplied = useRef(false);

  useEffect(() => {
    if (onboardingStarted.current) return;
    onboardingStarted.current = true;
    track('onboarding_started', { mode: isAddPetMode ? 'add_pet' : 'first_pet' });
  }, [track, isAddPetMode]);

  useEffect(() => {
    if (step !== 'species' || pendingMatchApplied.current) return;
    const pendingBreed = consumePendingPetMatch();
    if (!pendingBreed) return;
    pendingMatchApplied.current = true;
    setData((prev) => ({ ...prev, breed: pendingBreed }));
  }, [step]);

  const stepIndex = STEP_ORDER.indexOf(step);

  if (isAddPetMode && !petAccess.isAllowed) {
    return (
      <>
        <div className={limitStyles.page}>
          <Link to={ROUTES.LANDING} className={limitStyles.logo} aria-label="PetClues home">
            PetClues
          </Link>
          <p className={limitStyles.eyebrow}>Pet limit reached</p>
          <h1 className={limitStyles.title}>Your family is growing</h1>
          <p className={limitStyles.description}>
            Upgrade to Plus to manage more pets and unlock unlimited care history.
          </p>
          <button type="button" onClick={() => navigate(ROUTES.DASHBOARD)} className={limitStyles.back}>
            Back to dashboard
          </button>
        </div>
        <EditorialUpgradeModal
          isOpen
          onClose={() => navigate(ROUTES.DASHBOARD)}
          eyebrow="PetClues Plus"
          title="Your family is growing"
          description="Upgrade to Plus to manage up to 3 pets and unlock unlimited care history."
          requiredTier="Plus"
        />
      </>
    );
  }

  const updateData = (updates: Partial<OnboardingPetData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const submitPet = async () => {
    setSubmitError('');
    setSubmitting(true);
    try {
      await createPetFromOnboarding(data);
      if (!user?.needsOnboarding) {
        track('pet_created', { species: data.species, source: 'add_another_pet' });
      } else {
        await completeOnboarding();
        track('onboarding_completed', { species: data.species });
      }
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setSubmitError(
        getUserFacingError(err, 'pet', 'Unable to create your pet. Please try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = async () => {
    if (step === 'age') {
      await submitPet();
      return;
    }
    setStep(STEP_ORDER[stepIndex + 1]);
  };

  const goBack = () => {
    if (stepIndex > 0) setStep(STEP_ORDER[stepIndex - 1]);
  };

  const isLastStep = step === 'age';

  const nextDisabled =
    submitting ||
    (step === 'name' && data.name.trim() === '') ||
    (step === 'species' && data.species === '');

  const nextLabel = isLastStep
    ? submitting
      ? 'Opening your journal…'
      : isAddPetMode
        ? 'Enter Dashboard'
        : 'Open the Journal'
    : 'Continue';

  const stepNumber = ONBOARDING_STEPS.findIndex((s) => s.id === step) + 1;

  return (
    <div className={shell.shell}>
      <aside className={shell.hero}>
        <img src={HERO_IMAGE} alt="" className={shell.heroImage} aria-hidden />
        <div className={shell.heroScrim} aria-hidden />
        <Link to={ROUTES.LANDING} className={shell.heroLogo} aria-label="PetClues home">
          PetClues
        </Link>
        <div className={shell.heroCopy}>
          <p className={shell.heroEyebrow}>Picture Pro care</p>
          <p className={shell.heroTitle}>
            A calmer way to remember every vet visit, vaccine, and quiet milestone.
          </p>
        </div>
      </aside>

      <div className={shell.panel}>
        <header className={shell.header}>
          <div className={shell.headerInner}>
            <p className={shell.stepCounter}>
              Step {stepNumber} of {ONBOARDING_STEPS.length}
            </p>
            <div className={shell.progressWrap}>
              <OnboardingProgress currentStep={step} />
            </div>
          </div>
        </header>

        <div className={shell.scroll}>
          <div className={shell.stepArea}>
            {submitError && isLastStep && (
              <p className={shell.error} role="alert">
                {submitError}
              </p>
            )}
            <div key={step} className={shell.stepFrame}>
              {step === 'portrait' && <PortraitStep data={data} onChange={updateData} />}
              {step === 'name' && <NameStep data={data} onChange={updateData} />}
              {step === 'species' && <SpeciesStep data={data} onChange={updateData} />}
              {step === 'age' && <AgeStep data={data} onChange={updateData} />}
            </div>
          </div>
        </div>

        <footer className={shell.footer}>
          <div className={shell.footerInner}>
            <OnboardingNavigation
              onBack={stepIndex > 0 ? goBack : undefined}
              onNext={() => void goNext()}
              nextLabel={nextLabel}
              showBack={stepIndex > 0}
              nextDisabled={nextDisabled}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}

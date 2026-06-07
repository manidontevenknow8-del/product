import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PetCluesLogo } from '@/components/brand';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { useAnalytics } from '@/analytics';
import {
  emptyOnboardingData,
  type OnboardingPetData,
  type OnboardingStepId,
} from '@/types/onboarding';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';
import { OnboardingProgress } from './OnboardingProgress';
import { OnboardingNavigation } from './OnboardingNavigation';
import { OnboardingIntro } from './OnboardingIntro';
import { PetBasicDetailsForm } from './PetBasicDetailsForm';
import { PetHealthDetailsForm } from './PetHealthDetailsForm';
import { OnboardingConfirmation } from './OnboardingConfirmation';
import shellStyles from './OnboardingShell.module.css';

const STEP_ORDER: OnboardingStepId[] = ['intro', 'basics', 'health', 'confirm'];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const { createPetFromOnboarding } = usePets();
  const { track } = useAnalytics();
  const [step, setStep] = useState<OnboardingStepId>('intro');
  const [data, setData] = useState<OnboardingPetData>(emptyOnboardingData);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const onboardingStarted = useRef(false);

  useEffect(() => {
    if (onboardingStarted.current) return;
    onboardingStarted.current = true;
    track('onboarding_started');
  }, [track]);

  const stepIndex = STEP_ORDER.indexOf(step);

  const updateData = (updates: Partial<OnboardingPetData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const goNext = async () => {
    if (step === 'confirm') {
      setSubmitError('');
      setSubmitting(true);
      try {
        await createPetFromOnboarding(data);
        await completeOnboarding();
        track('onboarding_completed', { species: data.species });
        navigate(ROUTES.DASHBOARD);
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : 'Unable to create your pet. Please try again.',
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep(STEP_ORDER[stepIndex + 1]);
  };

  const goBack = () => {
    if (stepIndex > 0) setStep(STEP_ORDER[stepIndex - 1]);
  };

  const goToStep = (target: OnboardingStepId) => setStep(target);

  const basicsValid = data.name.trim() !== '' && data.species !== '';

  const nextLabel =
    step === 'intro'
      ? 'Get started'
      : step === 'confirm'
        ? submitting
          ? 'Creating profile…'
          : 'Go to dashboard'
        : 'Save & continue';

  const visualTitle =
    step === 'intro'
      ? 'Welcome to a calmer way to care'
      : step === 'basics'
        ? 'Tell us about your companion'
        : step === 'health'
          ? 'Build their health foundation'
          : 'Almost there';

  const visualSubtitle =
    step === 'intro'
      ? 'Health records, reminders, and emergency details — beautifully organized in one place.'
      : step === 'basics'
        ? 'A name, species, and a few basics — then we tailor everything to your pet.'
        : step === 'health'
          ? 'Optional details now make reminders and records smarter later.'
          : 'Review everything once, then step into your personalized dashboard.';

  return (
    <div className={shellStyles.shell}>
      <aside className={shellStyles.visual} aria-hidden>
        <img src={PAGE_IMG.app.onboarding} alt="" className={shellStyles.visualImg} />
        <div className={shellStyles.visualScrim} />
        <div className={shellStyles.visualCopy}>
          <p className={shellStyles.visualEyebrow}>PetClues</p>
          <h2 className={shellStyles.visualTitle}>{visualTitle}</h2>
          <p className={shellStyles.visualSubtitle}>{visualSubtitle}</p>
        </div>
      </aside>

      <div className={shellStyles.formSide}>
        <div className={shellStyles.top}>
          <Link to={ROUTES.LANDING} className={shellStyles.logo} aria-label="PetClues home">
            <PetCluesLogo size="md" />
          </Link>
          {step !== 'intro' && <OnboardingProgress currentStep={step} />}
        </div>

        <div className={shellStyles.main}>
          <div className={shellStyles.content}>
            {submitError && step === 'confirm' && (
              <p className={shellStyles.error} role="alert">
                {submitError}
              </p>
            )}
            <div key={step} className={shellStyles.step}>
              {step === 'intro' && <OnboardingIntro />}
              {step === 'basics' && (
                <PetBasicDetailsForm data={data} onChange={updateData} />
              )}
              {step === 'health' && (
                <PetHealthDetailsForm data={data} onChange={updateData} />
              )}
              {step === 'confirm' && (
                <OnboardingConfirmation
                  data={data}
                  onEditBasics={() => goToStep('basics')}
                  onEditHealth={() => goToStep('health')}
                />
              )}
            </div>
          </div>
        </div>

        <div className={shellStyles.footer}>
          <OnboardingNavigation
            isIntro={step === 'intro'}
            showBack={step !== 'intro'}
            onBack={goBack}
            onNext={goNext}
            nextLabel={nextLabel}
            nextDisabled={(step === 'basics' && !basicsValid) || submitting}
          />
        </div>
      </div>
    </div>
  );
}

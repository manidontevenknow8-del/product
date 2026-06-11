import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EditorialUpgradeModal } from '@/components/ui';
import { usePets } from '@/pets';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { ROUTES } from '@/routes/paths';

type AddAnotherPetButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
};

export function AddAnotherPetButton({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className,
}: AddAnotherPetButtonProps) {
  const { pets } = usePets();
  const petAccess = useFeatureAccess('pets');
  const navigate = useNavigate();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (pets.length === 0) return null;

  const allowed = petAccess.isAllowed;

  const handleClick = () => {
    if (allowed) {
      navigate(`${ROUTES.ONBOARDING}?add=true`);
      return;
    }
    setUpgradeOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={className}
        onClick={handleClick}
      >
        Add another pet
      </Button>
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

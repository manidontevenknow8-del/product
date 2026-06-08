import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { UpgradeModal } from '@/components/subscription';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { canAddPet } from '@/subscription/featureGates';
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
  const { user } = useAuth();
  const { pets } = usePets();
  const navigate = useNavigate();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (pets.length === 0) return null;

  const allowed = canAddPet(
    {
      subscriptionStatus: user?.subscriptionStatus,
      subscriptionTier: user?.subscriptionTier,
    },
    pets.length,
  );

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
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}

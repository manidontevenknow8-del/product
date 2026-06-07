import { Avatar, Badge, LoadingState } from '@/components/ui';
import type { Pet } from '@/types';
import styles from './DashboardHeader.module.css';

type DashboardPet = Pet & { photo?: string | null };

type DashboardHeaderProps = {
  pet: DashboardPet;
  status: {
    label: string;
    variant: 'success' | 'warning' | 'default';
  };
  foundingMember?: boolean;
};

export function DashboardHeader({ pet, status, foundingMember = false }: DashboardHeaderProps) {
  const meta = [pet.breed, pet.age].filter(Boolean).join(' · ');

  return (
    <header className={styles.header}>
      <div className={styles.avatar}>
        {pet.photo ? (
          <img src={pet.photo} alt={pet.name} className={styles.photo} />
        ) : (
          <Avatar initials={pet.avatarInitials} size="lg" />
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.greeting}>Good morning</span>
        <h1 className={styles.name}>{pet.name}</h1>
        <p className={styles.meta}>{meta}</p>
      </div>
      <div className={styles.badgeWrap}>
        <Badge variant={status.variant}>{status.label}</Badge>
        {foundingMember && (
          <Badge variant="dark">Founding Member</Badge>
        )}
      </div>
    </header>
  );
}

export function DashboardHeaderLoading() {
  return <LoadingState message="Loading your pet" />;
}

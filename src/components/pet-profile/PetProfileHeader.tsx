import { Avatar, Badge, Button } from '@/components/ui';
import type { PetProfile, ProfileStatus } from '@/types/profile';
import styles from './PetProfileHeader.module.css';

const speciesLabel: Record<string, string> = {
  dog: 'Dog',
  cat: 'Cat',
  other: 'Other',
};

type PetProfileHeaderProps = {
  profile: PetProfile;
  status: ProfileStatus;
  onEdit: () => void;
};

export function PetProfileHeader({ profile, status, onEdit }: PetProfileHeaderProps) {
  const meta = [
    profile.breed,
    speciesLabel[profile.species],
    profile.age,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <header className={styles.header}>
      <div className={styles.avatarWrap}>
        {profile.photo ? (
          <img src={profile.photo} alt={profile.name} className={styles.photo} />
        ) : (
          <Avatar initials={profile.avatarInitials} size="xl" />
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.eyebrow}>Pet vault</span>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.meta}>{meta}</p>
        <div className={styles.badges}>
          <Badge variant={status.variant}>{status.label}</Badge>
          <Badge variant="default">{speciesLabel[profile.species]}</Badge>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit profile
        </Button>
      </div>
    </header>
  );
}

import styles from './PetCluesLogo.module.css';

export const PETCLUES_LOGO_SRC = '/images/petclues-logo.png';

type PetCluesLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

export function PetCluesLogo({ size = 'md', className }: PetCluesLogoProps) {
  return (
    <img
      src={PETCLUES_LOGO_SRC}
      alt="PetClues"
      className={`${styles.logo} ${styles[size]}${className ? ` ${className}` : ''}`}
      decoding="async"
    />
  );
}

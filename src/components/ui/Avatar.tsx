import styles from './Avatar.module.css';

type AvatarProps = {
  initials: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dark';
};

export function Avatar({ initials, size = 'md', variant = 'default' }: AvatarProps) {
  return (
    <div className={`${styles.avatar} ${styles[size]} ${variant === 'dark' ? styles.dark : ''}`}>
      {initials}
    </div>
  );
}

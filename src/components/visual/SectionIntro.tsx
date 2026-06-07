import styles from './SectionIntro.module.css';

type SectionIntroProps = {
  title: string;
  description?: string;
  eyebrow?: string;
};

export function SectionIntro({ title, description, eyebrow }: SectionIntroProps) {
  return (
    <header className={styles.intro}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.text}>{description}</p>}
    </header>
  );
}

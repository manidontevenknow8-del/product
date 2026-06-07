import styles from './GettingStartedStrip.module.css';

export type GettingStartedStep = {
  step: string;
  title: string;
  body: string;
  image: string;
  alt: string;
};

type GettingStartedStripProps = {
  title: string;
  description?: string;
  steps: readonly GettingStartedStep[];
};

export function GettingStartedStrip({ title, description, steps }: GettingStartedStripProps) {
  return (
    <section className={styles.section} aria-labelledby="getting-started-title">
      <header className={styles.header}>
        <h2 id="getting-started-title" className={styles.title}>
          {title}
        </h2>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <div className={styles.grid}>
        {steps.map((item) => (
          <article key={item.step} className={styles.card}>
            <div className={styles.thumb}>
              <img src={item.image} alt={item.alt} className={styles.thumbImg} loading="lazy" />
              <span className={styles.step}>{item.step}</span>
            </div>
            <div className={styles.copy}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardBody}>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

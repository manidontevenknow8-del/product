import styles from './VisualFeatureGrid.module.css';

export type VisualFeatureItem = {
  title: string;
  body: string;
  image: string;
  alt: string;
};

type VisualFeatureGridProps = {
  items: readonly VisualFeatureItem[];
  columns?: 2 | 3;
};

export function VisualFeatureGrid({ items, columns = 2 }: VisualFeatureGridProps) {
  return (
    <div className={`${styles.grid} ${columns === 3 ? styles.gridThree : ''}`}>
      {items.map((item) => (
        <article key={item.title} className={styles.card}>
          <div className={styles.media}>
            <img src={item.image} alt={item.alt} className={styles.image} loading="lazy" />
          </div>
          <div className={styles.body}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.text}>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

import styles from './DataFacts.module.css';

export type DataFactRow = {
  label: string;
  value: string;
};

type DataFactsProps = {
  title: string;
  rows: DataFactRow[];
  /** Optional multi-value lists rendered under the table. */
  lists?: { heading: string; items: string[] }[];
};

/** Scannable unique-data block. Prefer this over burying facts in prose. */
export function DataFacts({ title, rows, lists }: DataFactsProps) {
  return (
    <section className={styles.root} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {lists?.map((list) => (
        <div key={list.heading} className={styles.listBlock}>
          <h3 className={styles.listHeading}>{list.heading}</h3>
          <ul className={styles.list}>
            {list.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

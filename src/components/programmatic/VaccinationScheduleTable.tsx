import type { ProgrammaticScheduleRow } from '@/types/programmaticPage';
import styles from './ProgrammaticSections.module.css';

type VaccinationScheduleTableProps = {
  rows: ProgrammaticScheduleRow[];
};

export function VaccinationScheduleTable({ rows }: VaccinationScheduleTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>Recommended vaccination timeline (confirm with your vet)</caption>
        <thead>
          <tr>
            <th scope="col">Age / interval</th>
            <th scope="col">Vaccines</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.age}-${row.vaccines.join('-')}`}>
              <th scope="row">{row.age}</th>
              <td>
                <ul className={styles.inlineList}>
                  {row.vaccines.map((vaccine) => (
                    <li key={vaccine}>{vaccine}</li>
                  ))}
                </ul>
              </td>
              <td>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

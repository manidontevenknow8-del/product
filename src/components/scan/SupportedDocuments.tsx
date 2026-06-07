import { supportedDocumentTypes } from '@/data/scanData';
import { SUPPORTED_DOC_IMAGES } from '@/data/scanImages';
import styles from './SupportedDocuments.module.css';

export function SupportedDocuments() {
  return (
    <section className={styles.section} aria-labelledby="supported-docs-heading">
      <div className={styles.head}>
        <h2 id="supported-docs-heading" className={styles.title}>
          Works with any pet document
        </h2>
        <p className={styles.subtitle}>
          PetClues understands the documents you already have — no special format needed.
        </p>
      </div>
      <div className={styles.grid}>
        {supportedDocumentTypes.map((doc) => {
          const image = SUPPORTED_DOC_IMAGES[doc.id] ?? SUPPORTED_DOC_IMAGES.bill;
          return (
            <article key={doc.id} className={styles.item}>
              <div className={styles.media}>
                <img src={image} alt="" className={styles.img} loading="lazy" />
                <div className={styles.mediaScrim} aria-hidden />
              </div>
              <div className={styles.copy}>
                <h3 className={styles.label}>{doc.label}</h3>
                <p className={styles.description}>{doc.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AdvancedMedicalSchema } from '@/components/seo/AdvancedMedicalSchema';
import { ConversionCtaBand } from '@/components/seo/ConversionCtaBand';
import { Button } from '@/components/ui';
import {
  getBreedConditionBySegments,
  getBreedConditionPath,
  type BreedConditionMeta,
} from '@/data/breedConditions';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { ROUTES } from '@/routes/paths';
import { BreedConditionSEO, getBreedConditionBreadcrumbs } from '@/seo/breedConditionSeo';
import styles from './BreedConditionPage.module.css';

type BreedConditionViewProps = {
  meta: BreedConditionMeta;
};

function BreedConditionView({ meta }: BreedConditionViewProps) {
  return (
    <>
      <BreedConditionSEO meta={meta} />
      <AdvancedMedicalSchema data={meta} />
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs items={getBreedConditionBreadcrumbs(meta)} />

          <header className={styles.hero}>
            <p className={styles.eyebrow}>
              Clinical breed risk
              <span className={styles.risk}>{meta.riskLevel} risk</span>
            </p>
            <h1 className={styles.title}>
              {meta.condition} in {meta.breed}s
            </h1>
            <p className={styles.scientific}>{meta.scientificName}</p>
            <p className={styles.lead}>
              A high-urgency clinical brief for families and relocation partners who need symptoms,
              timelines, and digital tracking—not generic breed marketing.
            </p>
          </header>

          <section className={styles.chapter} aria-labelledby="overview-heading">
            <p className={styles.chapterKicker}>Clinical overview</p>
            <h2 id="overview-heading" className={styles.chapterTitle}>
              Why {meta.breed}s carry elevated {meta.condition} risk
            </h2>
            <p className={styles.body}>{meta.overview}</p>
          </section>

          <section className={styles.chapter} aria-labelledby="symptoms-heading">
            <p className={styles.chapterKicker}>Watch list</p>
            <h2 id="symptoms-heading" className={styles.chapterTitle}>
              Symptom checklist
            </h2>
            <ul className={styles.checklist}>
              {meta.symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </section>

          <section className={styles.chapter} aria-labelledby="protocol-heading">
            <p className={styles.chapterKicker}>Digital vault protocol</p>
            <h2 id="protocol-heading" className={styles.chapterTitle}>
              Emergency &amp; longitudinal management
            </h2>
            <ol className={styles.protocol}>
              {meta.managementProtocol.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <ConversionCtaBand
            headingId="breed-condition-cta-heading"
            title={`Secure a Genesis Vault for your ${meta.breed} today`}
            body={`$249 lifetime allocation — white-glove digitization of veterinary histories, titers, imaging, and ${meta.condition} timelines so every specialist, sitter, and border agent reads the same dossier.`}
          />

          <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

function BreedConditionNotFound() {
  return (
    <>
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.stateWrap}>
            <h1>Guide not found</h1>
            <p>This breed–condition guide is not in the PetClues clinical matrix yet.</p>
            <Link to={ROUTES.GUIDES}>
              <Button variant="secondary">Back to health guides</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

/**
 * Luxury pSEO landing for `/guides/:breed/:condition`.
 * When `meta` is provided (dispatcher), skips param lookup.
 */
export function BreedConditionPage({ meta: metaProp }: { meta?: BreedConditionMeta } = {}) {
  const params = useParams<{ breed?: string; condition?: string }>();
  const meta =
    metaProp ?? getBreedConditionBySegments(params.breed, params.condition);

  if (!meta) return <BreedConditionNotFound />;
  return <BreedConditionView meta={meta} />;
}

export function breedConditionCanonicalPath(meta: BreedConditionMeta): string {
  return getBreedConditionPath(meta);
}

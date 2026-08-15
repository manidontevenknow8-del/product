import { Link, useParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { Button } from '@/components/ui';
import {
  getRelocationPath,
  getRelocationRouteBySlug,
  listRelocationRoutes,
  type RelocationRouteMeta,
} from '@/data/relocationRoutes';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { ROUTES } from '@/routes/paths';
import {
  RelocationRouteSEO,
  RelocationHubSEO,
  getRelocationBreadcrumbs,
} from '@/seo/relocationSeo';
import styles from './RelocationRoutePage.module.css';

function AgencyBanner({ meta }: { meta: RelocationRouteMeta }) {
  return (
    <aside className={styles.agencyBanner} aria-label="IPATA agency offer">
      <p className={styles.agencyEyebrow}>B2B · IPATA relocation agencies</p>
      <p className={styles.agencyCopy}>
        Are you an IPATA Relocation Agency managing moves from {meta.origin.city} ({meta.origin.code}){' '}
        to {meta.destination.city} ({meta.destination.code})? Deploy this pre-built Customs Vault for
        your clients.
      </p>
      <Link
        className={styles.agencyCta}
        to={`${ROUTES.FOUNDING_MEMBERS}?intent=agency-relocation&route=${meta.slug}`}
      >
        Claim Agency Allocation
      </Link>
    </aside>
  );
}

function RelocationView({ meta }: { meta: RelocationRouteMeta }) {
  const related = listRelocationRoutes()
    .filter((route) => route.slug !== meta.slug)
    .filter(
      (route) =>
        route.origin.code === meta.origin.code ||
        route.destination.code === meta.destination.code,
    )
    .slice(0, 6);

  return (
    <>
      <RelocationRouteSEO meta={meta} />
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs items={getRelocationBreadcrumbs(meta)} />
          <AgencyBanner meta={meta} />

          <header className={styles.hero}>
            <p className={styles.eyebrow}>Customs &amp; quarantine dossier</p>
            <h1 className={styles.title}>
              {meta.origin.code} to {meta.destination.code} pet dog travel customs requirements
            </h1>
            <p className={styles.lead}>
              High-urgency compliance checklist for {meta.origin.city} → {meta.destination.city} pet
              relocation - rabies titer waits, DEFRA/USDA/AVS/DAFF forms, and quarantine gates for
              agencies and private clients.
            </p>
            <p className={styles.urgency}>{meta.urgencyNote}</p>
          </header>

          <section className={styles.stats} aria-label="Route compliance summary">
            <div>
              <p className={styles.statLabel}>Quarantine</p>
              <p className={styles.statValue}>{meta.quarantineDays}</p>
            </div>
            <div>
              <p className={styles.statLabel}>Rabies titer / wait</p>
              <p className={styles.statValue}>{meta.rabiesTiterWait}</p>
            </div>
            <div>
              <p className={styles.statLabel}>Airline note</p>
              <p className={styles.statValue}>{meta.airlineNotes}</p>
            </div>
          </section>

          <section className={styles.chapter} aria-labelledby="forms-heading">
            <p className={styles.kicker}>Key forms</p>
            <h2 id="forms-heading" className={styles.chapterTitle}>
              Documents for {meta.routeLabel}
            </h2>
            <ul className={styles.formList}>
              {meta.keyForms.map((form) => (
                <li key={form}>{form}</li>
              ))}
            </ul>
          </section>

          <section className={styles.chapter} aria-labelledby="checklist-heading">
            <p className={styles.kicker}>Operational workflow</p>
            <h2 id="checklist-heading" className={styles.chapterTitle}>
              Customs &amp; Quarantine Dossier Checklist
            </h2>
            <ol className={styles.checklist}>
              {meta.checklist.map((item, index) => (
                <li key={item.title}>
                  <span className={styles.checkIndex}>{index + 1}</span>
                  <div>
                    <p className={styles.checkTitle}>{item.title}</p>
                    <p className={styles.checkDetail}>{item.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {related.length > 0 && (
            <section className={styles.chapter} aria-labelledby="related-routes-heading">
              <p className={styles.kicker}>Connected corridors</p>
              <h2 id="related-routes-heading" className={styles.chapterTitle}>
                Related relocation routes
              </h2>
              <ul className={styles.related}>
                {related.map((route) => (
                  <li key={route.slug}>
                    <Link to={getRelocationPath(route)}>
                      {route.origin.code} → {route.destination.code} · {route.origin.city} to{' '}
                      {route.destination.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className={styles.disclaimer}>
            {HEALTH_DISCLAIMER} Relocation rules change - verify with official DEFRA, USDA, CDC,
            AVS, DAFF, and AQS sources before ticket issuance.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}

function RelocationNotFound() {
  return (
    <>
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.stateWrap}>
            <h1>Route not found</h1>
            <p>This airport corridor is not in the PetClues relocation matrix yet.</p>
            <Link to={ROUTES.RELOCATION}>
              <Button variant="secondary">Browse relocation corridors</Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export function RelocationRoutePage() {
  const { route: routeSlug } = useParams<{ route?: string }>();
  const meta = getRelocationRouteBySlug(routeSlug);
  if (!meta) return <RelocationNotFound />;
  return <RelocationView meta={meta} />;
}

export function RelocationHubPage() {
  const routes = listRelocationRoutes();
  return (
    <>
      <RelocationHubSEO />
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs
            items={[
              { name: 'Home', path: ROUTES.LANDING },
              { name: 'Pet Relocation Customs', path: ROUTES.RELOCATION },
            ]}
          />
          <header className={styles.hero}>
            <p className={styles.eyebrow}>B2B logistics matrix</p>
            <h1 className={styles.title}>Pet relocation customs corridors</h1>
            <p className={styles.lead}>
              Airport-pair dossiers for IPATA agencies and private clients - titer waits, quarantine
              gates, and form checklists for the world&apos;s densest pet cargo lanes.
            </p>
          </header>
          <ul className={styles.hubList}>
            {routes.map((route) => (
              <li key={route.slug}>
                <Link className={styles.hubLink} to={getRelocationPath(route)}>
                  <span className={styles.hubCodes}>
                    {route.origin.code} → {route.destination.code}
                  </span>
                  <span className={styles.hubCities}>
                    {route.origin.city} to {route.destination.city}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
}

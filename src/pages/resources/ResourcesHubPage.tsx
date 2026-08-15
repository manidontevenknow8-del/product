import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { RESOURCE_CITIES, RESOURCE_TOPICS, getResourcePath } from '@/data/resourceMatrix';
import { ResourceHubSEO, getResourceHubBreadcrumbs } from '@/seo/resourceSeo';
import { ROUTES } from '@/routes/paths';
import styles from '@/pages/guides/GuidesPages.module.css';

export function ResourcesHubPage() {
  const [cityLimit, setCityLimit] = useState(24);
  const visibleCities = RESOURCE_CITIES.slice(0, cityLimit);

  return (
    <>
      <ResourceHubSEO />
      <Header variant="landing" />
      <div className={styles.page}>
        <div className={styles.inner}>
          <Breadcrumbs items={getResourceHubBreadcrumbs()} />
          <header className={styles.hero}>
            <h1 className={styles.title}>Local pet record packets</h1>
            <p className={styles.lead}>
              {RESOURCE_CITIES.length} US metros times {RESOURCE_TOPICS.length} high-intent checklists
              for boarding vaccines, titer travel files, sitter handoffs, and ER kits. Built to convert
              into a PetClues vault.
            </p>
            <p className={styles.meta}>
              <Link to={ROUTES.GUIDES}>Health guides</Link>
              {' · '}
              <Link to={ROUTES.PET_VACCINATION_RECORDS}>Vaccination records</Link>
              {' · '}
              <Link to={ROUTES.DIGITAL_PET_PASSPORT}>Digital passport</Link>
            </p>
          </header>

          <h2 className={styles.sectionTitle}>Packet types</h2>
          <div className={styles.grid}>
            {RESOURCE_TOPICS.map((topic) => (
              <Link
                key={topic.slug}
                className={styles.card}
                to={getResourcePath(RESOURCE_CITIES[0].slug, topic.slug)}
              >
                <h2 className={styles.cardTitle}>{topic.label}</h2>
                <p className={styles.cardDesc}>{topic.kicker}</p>
                <span className={styles.cardLink}>Open in {RESOURCE_CITIES[0].name}</span>
              </Link>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>Cities</h2>
          <div className={styles.grid}>
            {visibleCities.map((city) => (
              <Link
                key={city.slug}
                className={styles.card}
                to={getResourcePath(city.slug, RESOURCE_TOPICS[0].slug)}
              >
                <h2 className={styles.cardTitle}>
                  {city.name}, {city.stateAbbr}
                </h2>
                <p className={styles.cardDesc}>{city.facilityNote}</p>
                <span className={styles.cardMeta}>{RESOURCE_TOPICS.length} packets</span>
                <span className={styles.cardLink}>Open boarding packet</span>
              </Link>
            ))}
          </div>
          {cityLimit < RESOURCE_CITIES.length && (
            <div className={styles.showMoreWrap}>
              <button type="button" className={styles.showMore} onClick={() => setCityLimit(RESOURCE_CITIES.length)}>
                Show all {RESOURCE_CITIES.length} cities
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

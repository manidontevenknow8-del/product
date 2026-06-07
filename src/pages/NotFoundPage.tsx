import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { Button } from '@/components/ui';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';
import { ROUTES } from '@/routes/paths';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <>
      <Header variant="landing" />
      <div className={styles.page}>
        <PageHeroBand
          image={PAGE_IMG.app.notFound}
          imageAlt=""
          eyebrow="404"
          title="Page not found"
          subtitle="This page doesn't exist or may have moved. Let's get you back on track."
          actions={
            <>
              <Link to={ROUTES.LANDING}>
                <Button variant="primary">Go home</Button>
              </Link>
              <Link to={ROUTES.FAQ}>
                <Button variant="secondary">View FAQ</Button>
              </Link>
            </>
          }
        />
        <p className={styles.disclaimer}>{HEALTH_DISCLAIMER}</p>
      </div>
      <SiteFooter />
    </>
  );
}

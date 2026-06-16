import { useLocation } from 'react-router-dom';
import { FAQ_PAGE_SCHEMA_ITEMS } from '@/data/faqSchemaItems';
import { getPageSEO, isBlogArticlePath, isIndexablePublicPath } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { buildBreadcrumbListSchema } from './breadcrumbSchema';
import { getStaticPageBreadcrumbs } from './pageBreadcrumbs';
import { useJsonLd } from './useJsonLd';
import {
  FaqStructuredData,
  LandingStructuredData,
  OrganizationStructuredData,
  WebSiteStructuredData,
} from './StructuredData';

type SEOProviderProps = {
  children: React.ReactNode;
};

function PageBreadcrumbStructuredData({ pathname }: { pathname: string }) {
  const schema = buildBreadcrumbListSchema(getStaticPageBreadcrumbs(pathname));
  useJsonLd(
    `breadcrumbs-${pathname}`,
    schema ?? { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [] },
  );
  return null;
}

export function SEOProvider({ children }: SEOProviderProps) {
  const { pathname } = useLocation();
  const config = getPageSEO(pathname);
  const isBlogRoute = pathname === ROUTES.BLOG || isBlogArticlePath(pathname);
  const isLanding = pathname === ROUTES.LANDING;
  const isFaq = pathname === ROUTES.FAQ;
  const showGlobalSchemas =
    isIndexablePublicPath(pathname) && !isBlogRoute && !isLanding;
  const showBreadcrumbs =
    isIndexablePublicPath(pathname) && !isBlogRoute && pathname !== ROUTES.LANDING;

  return (
    <>
      {!isBlogRoute && <MetaTags config={config} />}
      {!isBlogRoute && <OpenGraph config={config} />}
      {isLanding && <LandingStructuredData />}
      {showGlobalSchemas && (
        <>
          <OrganizationStructuredData />
          <WebSiteStructuredData />
        </>
      )}
      {showBreadcrumbs && getStaticPageBreadcrumbs(pathname).length > 0 && (
        <PageBreadcrumbStructuredData pathname={pathname} />
      )}
      {isFaq && <FaqStructuredData items={FAQ_PAGE_SCHEMA_ITEMS} />}
      {children}
    </>
  );
}

export { MetaTags, OpenGraph } from './MetaTags';
export { StructuredData } from './StructuredData';

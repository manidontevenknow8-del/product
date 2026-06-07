import { useLocation } from 'react-router-dom';
import { FAQ_PAGE_SCHEMA_ITEMS } from '@/data/faqSchemaItems';
import { getPageSEO, isBlogArticlePath, isIndexablePublicPath } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import {
  FaqStructuredData,
  LandingStructuredData,
  OrganizationStructuredData,
  WebSiteStructuredData,
} from './StructuredData';

type SEOProviderProps = {
  children: React.ReactNode;
};

export function SEOProvider({ children }: SEOProviderProps) {
  const { pathname } = useLocation();
  const config = getPageSEO(pathname);
  const isBlogRoute = pathname === ROUTES.BLOG || isBlogArticlePath(pathname);
  const isLanding = pathname === ROUTES.LANDING;
  const isFaq = pathname === ROUTES.FAQ;
  const showGlobalSchemas =
    isIndexablePublicPath(pathname) && !isBlogRoute && !isLanding;

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
      {isFaq && <FaqStructuredData items={FAQ_PAGE_SCHEMA_ITEMS} />}
      {children}
    </>
  );
}

export { MetaTags, OpenGraph } from './MetaTags';
export { StructuredData } from './StructuredData';

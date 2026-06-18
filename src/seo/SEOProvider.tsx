import { useLocation } from 'react-router-dom';
import { getPageSEO, isBestPath, isBlogArticlePath, isComparePath, isFaqPath, isGuidesPath, isLearnPath, isIndexablePublicPath } from '@/data/seoConfig';
import { ROUTES } from '@/routes/paths';
import { MetaTags, OpenGraph } from './MetaTags';
import { StaticPageStructuredData } from './staticPageSeo';
import {
  LandingStructuredData,
} from './StructuredData';

type SEOProviderProps = {
  children: React.ReactNode;
};

export function SEOProvider({ children }: SEOProviderProps) {
  const { pathname } = useLocation();
  const config = getPageSEO(pathname);
  const isBlogRoute = pathname === ROUTES.BLOG || isBlogArticlePath(pathname);
  const isCompareRoute = isComparePath(pathname);
  const isBestRoute = isBestPath(pathname);
  const isGuidesRoute = isGuidesPath(pathname);
  const isLearnRoute = isLearnPath(pathname);
  const isFaqRoute = isFaqPath(pathname);
  const isLanding = pathname === ROUTES.LANDING;
  const dedicatedSeoRoute = isBlogRoute || isCompareRoute || isBestRoute || isGuidesRoute || isLearnRoute || isFaqRoute;
  const showStaticPageSchema =
    isIndexablePublicPath(pathname) && !dedicatedSeoRoute && !isLanding;

  return (
    <>
      {!dedicatedSeoRoute && <MetaTags config={config} />}
      {!dedicatedSeoRoute && <OpenGraph config={config} />}
      {isLanding && <LandingStructuredData />}
      {showStaticPageSchema && (
        <StaticPageStructuredData pathname={pathname} config={config} />
      )}
      {children}
    </>
  );
}

export { MetaTags, OpenGraph } from './MetaTags';
export { StructuredData } from './StructuredData';

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { isMetaPixelEnabled, trackMetaPageView } from './metaPixel';

/** Keeps Meta Pixel PageView in sync with React Router navigations. */
export function MetaPixelRouteTracker() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isMetaPixelEnabled()) return;

    // Initial PageView is fired after init in main.tsx; skip duplicate on mount.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackMetaPageView();
  }, [location.pathname, location.search]);

  return null;
}

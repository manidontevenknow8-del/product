import { createContext, useContext, type ReactNode } from 'react';
import type { PrerenderRouteData } from './types';

const PrerenderDataContext = createContext<PrerenderRouteData | null>(null);

type PrerenderDataProviderProps = {
  data: PrerenderRouteData;
  children: ReactNode;
};

export function PrerenderDataProvider({ data, children }: PrerenderDataProviderProps) {
  return (
    <PrerenderDataContext.Provider value={data}>{children}</PrerenderDataContext.Provider>
  );
}

export function usePrerenderRouteData(): PrerenderRouteData | null {
  return useContext(PrerenderDataContext);
}

export function readHydrationPrerenderData(): PrerenderRouteData | null {
  if (typeof window === 'undefined') return null;
  return window.__PETCLUES_PRERENDER__ ?? null;
}

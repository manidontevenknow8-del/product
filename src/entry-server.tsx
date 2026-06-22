import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { PrerenderApp } from './prerender/PrerenderApp';
import { PrerenderProviders } from './prerender/PrerenderProviders';
import type { PrerenderRouteData } from './prerender/types';

function toRouterLocation(pathname: string, search: string): string {
  if (!search) return pathname;
  return `${pathname}${search.startsWith('?') ? search : `?${search}`}`;
}

export function render(pathname: string, search = '', data: PrerenderRouteData = {}): string {
  const location = toRouterLocation(pathname, search);

  return renderToStaticMarkup(
    <StaticRouter location={location}>
      <PrerenderProviders data={data}>
        <PrerenderApp />
      </PrerenderProviders>
    </StaticRouter>,
  );
}

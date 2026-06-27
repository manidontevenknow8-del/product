import strikingDistanceData from '@/data/striking-distance.json';

/** One GSC striking-distance target — url path + query to use as anchor text. */
export type AuthorityLinkTarget = {
  url: string;
  anchorText: string;
};

type DynamicAuthorityLinksProps = {
  /**
   * Override the baked-in GSC targets (defaults to striking-distance.json).
   * Useful in Storybook or when passing server-fetched data.
   */
  links?: AuthorityLinkTarget[];
  /**
   * When set, the current page is omitted so the block never self-links.
   * Pass a pathname such as `/blog/dog-mri-cost`.
   */
  currentPath?: string;
};

const DEFAULT_LINKS = strikingDistanceData as AuthorityLinkTarget[];

/**
 * Quiet-luxury inline authority links sourced from GSC striking-distance data.
 *
 * Uses native `<a href>` tags only — no React Router, no onClick handlers —
 * so Googlebot can crawl them as standard dofollow internal links.
 */
export function DynamicAuthorityLinks({
  links = DEFAULT_LINKS,
  currentPath,
}: DynamicAuthorityLinksProps) {
  const visible = currentPath
    ? links.filter(
        (link) =>
          link.url !== currentPath &&
          link.url !== currentPath.replace(/\/+$/, '') &&
          `${link.url}/` !== currentPath,
      )
    : links;

  if (visible.length === 0) {
    return null;
  }

  return (
    <nav
      className="border-t border-zinc-200 py-10"
      aria-label="Related clinical topics"
    >
      <p className="text-sm leading-relaxed tracking-wide text-zinc-600">
        <span className="text-zinc-600">Related clinical topics: </span>
        {visible.map((link, index) => (
          <span key={link.url}>
            {index > 0 ? (
              <span className="text-zinc-300" aria-hidden="true">
                {' · '}
              </span>
            ) : null}
            <a
              href={link.url}
              className="text-zinc-500 transition-colors duration-200 hover:text-zinc-900"
            >
              {link.anchorText}
            </a>
          </span>
        ))}
      </p>
    </nav>
  );
}

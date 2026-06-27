/**
 * Global, dependency-free scroll-reveal for the editorial shell.
 * - Adds `.ed-anim` to <html> synchronously so chapters render pre-hidden (no flash).
 * - Reveals `.ed-chapter / .ed-band / .ed-stats / .ed-footnote` as they enter view.
 * - A MutationObserver re-scans on SPA route changes, so no per-page wiring is needed.
 * No-JS / reduced-motion users keep fully visible content (handled in CSS).
 */

const REVEAL_SELECTOR = '.ed-chapter, .ed-band, .ed-stats, .ed-footnote, [data-reveal]';

let started = false;

export function initEditorialReveal(): void {
  if (started || typeof window === 'undefined' || typeof document === 'undefined') return;
  started = true;

  const root = document.documentElement;
  root.classList.add('ed-anim');

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (reduceMotion) return;

  const seen = new WeakSet<Element>();

  const io = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  const scan = () => {
    const nodes = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);
    nodes.forEach((node) => {
      if (seen.has(node)) return;
      seen.add(node);
      // Reveal immediately if already on-screen at scan time (above the fold).
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        node.classList.add('is-visible');
      } else {
        io.observe(node);
      }
    });
  };

  // Initial scan after first paint.
  requestAnimationFrame(() => requestAnimationFrame(scan));

  // Re-scan when the SPA swaps routes / adds content.
  let raf = 0;
  const mo = new MutationObserver(() => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      scan();
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

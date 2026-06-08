/** Scroll to a landing-page section by id (with or without leading #). */
export function scrollToLandingSection(
  sectionId: string,
  behavior: ScrollBehavior = 'smooth',
): boolean {
  const id = sectionId.replace(/^#/, '');
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: 'start' });
  return true;
}

/** Retry scroll after route change so sections exist in the DOM. */
export function scrollToLandingSectionWhenReady(
  sectionId: string,
  behavior: ScrollBehavior = 'smooth',
): void {
  const id = sectionId.replace(/^#/, '');

  const attempt = () => scrollToLandingSection(id, behavior);

  if (attempt()) return;

  requestAnimationFrame(() => {
    if (attempt()) return;
    window.setTimeout(attempt, 120);
  });
}

import { useEffect, useRef, useState } from 'react';

type UseExitIntentOptions = {
  /** Only fire once per page session unless reset. */
  enabled?: boolean;
  /** Desktop: mouse leaves viewport toward top chrome. */
  desktopEnabled?: boolean;
  /** Mobile: rapid upward scroll near top. */
  mobileEnabled?: boolean;
};

/**
 * Exit-intent detector for desktop mouse-out + mobile rapid upward scroll.
 * Fires at most once while mounted (unless `enabled` flips off→on).
 */
export function useExitIntent({
  enabled = true,
  desktopEnabled = true,
  mobileEnabled = true,
}: UseExitIntentOptions = {}) {
  const [triggered, setTriggered] = useState(false);
  const firedRef = useRef(false);
  const lastScrollY = useRef(0);
  const lastScrollTs = useRef(0);

  useEffect(() => {
    if (!enabled) {
      firedRef.current = false;
      setTriggered(false);
      return;
    }

    function fire() {
      if (firedRef.current) return;
      firedRef.current = true;
      setTriggered(true);
    }

    function onMouseOut(event: MouseEvent) {
      if (!desktopEnabled) return;
      if (event.relatedTarget != null) return;
      if (event.clientY > 12) return;
      fire();
    }

    function onScroll() {
      if (!mobileEnabled) return;
      if (window.matchMedia('(pointer: fine)').matches) return;
      const y = window.scrollY;
      const now = Date.now();
      const dy = lastScrollY.current - y;
      const dt = Math.max(1, now - lastScrollTs.current);
      const velocity = dy / dt;
      lastScrollY.current = y;
      lastScrollTs.current = now;
      // Fast upward fling near the top of the page
      if (y < 80 && velocity > 1.8) fire();
    }

    lastScrollY.current = window.scrollY;
    lastScrollTs.current = Date.now();

    document.addEventListener('mouseout', onMouseOut);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, desktopEnabled, mobileEnabled]);

  return {
    triggered,
    dismiss: () => setTriggered(false),
  };
}

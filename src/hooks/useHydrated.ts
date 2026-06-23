import { useEffect, useState } from 'react';

/** True after the client has mounted, use to skip SSR-hostile motion initial states. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

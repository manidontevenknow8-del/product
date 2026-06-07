import { useEffect } from 'react';

export function useJsonLd(id: string, data: object) {
  const serialized = JSON.stringify(data);

  useEffect(() => {
    const scriptId = `petclues-structured-data-${id}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = serialized;

    return () => {
      script?.remove();
    };
  }, [id, serialized]);
}

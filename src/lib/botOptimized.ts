/** True when edge middleware served a crawler-optimized document. */
export function isBotOptimized(): boolean {
  if (typeof document === 'undefined') return false;

  return (
    document.querySelector('meta[name="petclues-bot-optimized"][content="true"]') !== null ||
    new URLSearchParams(window.location.search).get('bot-optimized') === 'true'
  );
}

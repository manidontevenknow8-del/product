export {};

declare global {
  interface Window {
    fbq?: {
      (...args: unknown[]): void;
      callMethod?: (...args: unknown[]) => void;
      queue: unknown[];
      loaded: boolean;
      push: (...args: unknown[]) => void;
      version: string;
    };
    _fbq?: Window['fbq'];
  }
}

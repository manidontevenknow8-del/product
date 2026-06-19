import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { LoadingState } from '@/components/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyRoute<T extends ComponentType<any>>(
  factory: () => Promise<Record<string, T>>,
  exportName: string,
) {
  return lazy(() => factory().then((module) => ({ default: module[exportName] as T })));
}

type RouteFallbackProps = {
  children: ReactNode;
};

export function RouteFallback({ children }: RouteFallbackProps) {
  return (
    <Suspense fallback={<LoadingState message="Loading" fullPage />}>
      {children}
    </Suspense>
  );
}

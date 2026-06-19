import { App } from '@/App';
import { FullProviders } from './FullProviders';

export function AppShell() {
  return (
    <FullProviders>
      <App />
    </FullProviders>
  );
}

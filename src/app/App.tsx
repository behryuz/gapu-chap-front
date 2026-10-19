import { session } from '@/entities/viewer';
import { configureHttp } from '@/shared/api';
import { Toaster } from '@/shared/ui';

import { ErrorBoundary } from './error/ErrorBoundary';
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './routing/AppRouter';
import { endSession } from './session/end-session';

import './styles/index.css';

// Связываем HTTP-клиент (shared) с сессией (entities). Делается один раз в слое app.
configureHttp({
  getToken: session.getToken,
  onUnauthorized: endSession,
});

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
        <Toaster />
      </AppProviders>
    </ErrorBoundary>
  );
}

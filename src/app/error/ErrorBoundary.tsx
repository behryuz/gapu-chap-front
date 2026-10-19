import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { Button, EmptyState } from '@/shared/ui';

interface State {
  error: Error | null;
}

/** Последний рубеж: вместо белого экрана — понятное сообщение и кнопка перезагрузки. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ height: '100dvh' }}>
          <EmptyState
            icon="close"
            title="Что-то сломалось"
            description="Произошла непредвиденная ошибка. Перезагрузите страницу — данные на сервере не пострадали."
            action={<Button onClick={() => window.location.reload()}>Перезагрузить</Button>}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

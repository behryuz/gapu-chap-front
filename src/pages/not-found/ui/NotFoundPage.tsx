import { Link } from 'react-router';

import { routes } from '@/shared/config';
import { EmptyState } from '@/shared/ui';

import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <EmptyState
        icon="search"
        title="Страница не найдена"
        description="Такого адреса нет. Возможно, ссылка устарела."
        action={
          <Link to={routes.home} className={styles.link}>
            На главную
          </Link>
        }
      />
    </main>
  );
}

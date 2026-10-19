import { Link, useLocation, useNavigate } from 'react-router';

import { LoginForm } from '@/features/auth-by-username';
import { routes } from '@/shared/config';
import { AuthCard } from '@/shared/ui';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Вернуть пользователя туда, куда он шёл до редиректа на логин.
  const from = (location.state as { from?: string } | null)?.from ?? routes.home;

  return (
    <AuthCard
      title="Вход"
      subtitle="Рады видеть снова"
      footer={
        <>
          Нет аккаунта? <Link to={routes.register}>Зарегистрироваться</Link>
        </>
      }
    >
      <LoginForm onSuccess={() => void navigate(from, { replace: true })} />
    </AuthCard>
  );
}

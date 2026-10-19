import { Link, useNavigate } from 'react-router';

import { RegisterForm } from '@/features/register';
import { routes } from '@/shared/config';
import { AuthCard } from '@/shared/ui';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthCard
      title="Регистрация"
      subtitle="Создайте аккаунт, чтобы общаться в комнатах"
      footer={
        <>
          Уже есть аккаунт? <Link to={routes.login}>Войти</Link>
        </>
      }
    >
      <RegisterForm onSuccess={() => void navigate(routes.home, { replace: true })} />
    </AuthCard>
  );
}

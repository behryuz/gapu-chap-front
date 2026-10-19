import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

import { isSessionExpired, session, useViewer } from '@/entities/viewer';
import { routes } from '@/shared/config';

import { RealtimeBridge } from '../realtime/RealtimeBridge';

/** Пускает только с живой сессией и поднимает WebSocket на всё время работы в чате. */
export function RequireAuth() {
  const viewer = useViewer();
  const location = useLocation();
  const expired = isSessionExpired(viewer);

  // Токен истечёт, пока вкладка открыта, — выходим ровно в этот момент.
  useEffect(() => {
    if (!viewer) {
      return;
    }
    const timeout = viewer.expiresAt - Date.now();
    if (timeout <= 0) {
      session.clear();
      return;
    }
    const timer = setTimeout(() => session.clear(), Math.min(timeout, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [viewer]);

  if (expired) {
    return <Navigate to={routes.login} replace state={{ from: location.pathname }} />;
  }

  return (
    <>
      <RealtimeBridge />
      <Outlet />
    </>
  );
}

export function GuestOnly() {
  const viewer = useViewer();
  if (!isSessionExpired(viewer)) {
    return <Navigate to={routes.home} replace />;
  }
  return <Outlet />;
}

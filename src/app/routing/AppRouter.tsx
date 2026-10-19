import { Route, Routes } from 'react-router';

import { ChatPage } from '@/pages/chat';
import { LoginPage } from '@/pages/login';
import { ModerationPage } from '@/pages/moderation';
import { NotFoundPage } from '@/pages/not-found';
import { RegisterPage } from '@/pages/register';

import { GuestOnly, RequireAuth } from './guards';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<ChatPage />} />
        <Route path="/rooms/:roomId" element={<ChatPage />} />
        <Route path="/moderation" element={<ModerationPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

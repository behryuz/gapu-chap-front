/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = env.BACKEND_URL ?? 'http://localhost:8081';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      // Фронт и бэкенд с точки зрения браузера живут на одном origin (localhost:5173),
      // поэтому CORS не нужен. changeOrigin не включаем: WebSocket-библиотека бэкенда
      // сверяет заголовок Origin с Host, и они должны совпадать.
      proxy: {
        '/api': { target: backend },
        '/health': { target: backend },
        '/ws': { target: backend, ws: true },
      },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  };
});

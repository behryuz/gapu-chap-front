import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // FSD: в слайс заходим только через публичный API (index.ts), не вглубь.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/app/*/**',
                '@/pages/*/**',
                '@/widgets/*/**',
                '@/features/*/**',
                '@/entities/*/**',
              ],
              message: 'Импортируйте слайс через его публичный API: @/<layer>/<slice>',
            },
          ],
        },
      ],
    },
  },
);

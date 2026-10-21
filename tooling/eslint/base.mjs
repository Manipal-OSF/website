import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import globals from 'globals';
export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/.astro/**',
    '**/.next/**',
    '**/next-env.d.ts',
    '**/.turbo/**',
    '**/.react-email/**',
    '**/dist/**',
    '**/.vercel/**',
  ]),
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
]);

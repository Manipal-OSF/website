import { defineConfig, globalIgnores } from 'eslint/config';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextTypescript,
  globalIgnores([
    '**/node_modules/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/.react-email/**',
    '**/dist/**',
    '**/next-env.d.ts',
  ]),
]);

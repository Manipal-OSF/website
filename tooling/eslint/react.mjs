import { defineConfig } from 'eslint/config';
import next from 'eslint-config-next';
import base from './base.mjs';

// Reuse the installed React and Hooks rules without Next.js application rules.
const react = next.find((config) => config.name === 'next');

export default defineConfig([
  {
    ...react,
    name: 'shared/react',
    plugins: Object.fromEntries(
      Object.entries(react.plugins).filter(([name]) => name !== '@next/next')
    ),
    rules: Object.fromEntries(
      Object.entries(react.rules).filter(
        ([name]) => !name.startsWith('@next/next/')
      )
    ),
  },
  ...base,
]);

import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import base from './base.mjs';
export default defineConfig([
  ...base,
  {
    files: ['**/*.tsx'],
    ...react.configs.flat.recommended,
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['**/*.tsx'],
    plugins: { 'react-hooks': hooks },
    rules: hooks.configs.recommended.rules,
  },
]);

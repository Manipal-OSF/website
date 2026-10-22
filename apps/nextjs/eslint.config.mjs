import { defineConfig } from 'eslint/config';
import next from '@next/eslint-plugin-next';
import react from '@tooling/eslint/react';

export default defineConfig([...react, next.configs['core-web-vitals']]);

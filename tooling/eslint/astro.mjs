import { defineConfig } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import base from './base.mjs';
export default defineConfig([...base, ...astro.configs.recommended]);

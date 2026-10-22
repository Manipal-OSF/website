import { loadRootEnv } from '@packages/env/load';
import { defineConfig } from 'drizzle-kit';
import config from './drizzle.config';

loadRootEnv('development');

if (!process.env.DEV_DATABASE_URL)
  throw new Error(
    'Set DEV_DATABASE_URL before migrating the development database.',
  );

export default defineConfig({
  ...config,
  dbCredentials: { url: process.env.DEV_DATABASE_URL },
});

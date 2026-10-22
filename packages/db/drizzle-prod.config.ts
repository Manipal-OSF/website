import { loadRootEnv } from '@packages/env/load';
import { defineConfig } from 'drizzle-kit';
import config from './drizzle.config';

loadRootEnv('production');

if (!process.env.PROD_DATABASE_URL)
  throw new Error(
    'Set PROD_DATABASE_URL before migrating the production database.',
  );

export default defineConfig({
  ...config,
  dbCredentials: { url: process.env.PROD_DATABASE_URL },
});

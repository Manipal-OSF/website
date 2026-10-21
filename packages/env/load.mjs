import nextEnv from '@next/env';
import { fileURLToPath } from 'node:url';

export const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));

/** Load root .env files without coupling runtime validation to the filesystem. */
export function loadRootEnv(mode, directory = workspaceRoot) {
  if (!['development', 'production', 'test'].includes(mode)) {
    throw new Error(
      'Environment mode must be development, production, or test.'
    );
  }

  process.env.NODE_ENV = mode;
  return nextEnv.loadEnvConfig(directory, mode === 'development');
}

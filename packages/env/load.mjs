import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { expand } from 'dotenv-expand';

export const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));

/** Load root files in priority order; existing process values always win. */
export function loadRootEnv(mode, directory = workspaceRoot) {
  if (!['development', 'production', 'test'].includes(mode)) {
    throw new Error(
      'Environment mode must be development, production, or test.',
    );
  }
  process.env.NODE_ENV = mode;
  const files = [
    `.env.${mode}.local`,
    ...(mode === 'test' ? [] : ['.env.local']),
    `.env.${mode}`,
    '.env',
  ];
  for (const name of files) {
    const filename = path.join(directory, name);
    if (!existsSync(filename)) continue;
    expand({ parsed: parse(readFileSync(filename)), processEnv: process.env });
  }
  return { combinedEnv: process.env };
}

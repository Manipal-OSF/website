import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import { defineConfig } from 'drizzle-kit';

// Drizzle Kit prefixes output paths with './', so use cwd-relative package paths.
export default defineConfig({
  dialect: 'postgresql',
  schema: relative(
    process.cwd(),
    fileURLToPath(new URL('./src/schema/index.ts', import.meta.url)),
  ),
  out: relative(
    process.cwd(),
    fileURLToPath(new URL('./drizzle', import.meta.url)),
  ),
});

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

let migration;
switch (process.env.VERCEL_ENV) {
  case 'production':
    migration = 'db:migrate:prod';
    break;
  case 'preview':
  case 'development':
    migration = 'db:migrate:dev';
    break;
  default:
    console.error('VERCEL_ENV must be production, preview, or development.');
    process.exit(1);
}

const root = fileURLToPath(new URL('../../../', import.meta.url));
for (const args of [
  ['--filter', '@packages/db', 'db:check'],
  ['--filter', '@packages/db', migration],
  ['--filter', '@apps/nextjs', 'build'],
]) {
  const result = spawnSync('pnpm', args, { cwd: root, stdio: 'inherit' });
  if (result.error) {
    console.error(
      `Unable to run pnpm ${args.join(' ')}: ${result.error.message}`,
    );
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

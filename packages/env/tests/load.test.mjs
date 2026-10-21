import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { workspaceRoot } from '../load.mjs';

const loaderUrl = new URL('../load.mjs', import.meta.url).href;
const cli = fileURLToPath(new URL('../bin/with-env.mjs', import.meta.url));
const key = 'MONOREPO_ENV_TEST_VALUE';

function fixture(t) {
  const directory = mkdtempSync(path.join(tmpdir(), 'website-env-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function load(directory, mode, overrides = {}) {
  const environment = { ...process.env, ...overrides };
  delete environment.__NEXT_PROCESSED_ENV;
  if (!(key in overrides)) delete environment[key];
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
      import { loadRootEnv } from ${JSON.stringify(loaderUrl)};
      loadRootEnv(${JSON.stringify(mode)}, ${JSON.stringify(directory)});
      console.log(process.env.${key} ?? 'unset');
    `,
    ],
    { cwd: tmpdir(), env: environment, encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

test('loads root files independently of the working directory and respects precedence', (t) => {
  const directory = fixture(t);
  writeFileSync(path.join(directory, '.env'), `${key}=base\n`);
  writeFileSync(path.join(directory, '.env.local'), `${key}=local\n`);
  writeFileSync(
    path.join(directory, '.env.production.local'),
    `${key}=production\n`
  );
  assert.equal(load(directory, 'development'), 'local');
  assert.equal(load(directory, 'production'), 'production');
  assert.equal(
    load(directory, 'production', { [key]: 'provided' }),
    'provided'
  );
  assert.equal(load(directory, 'test'), 'base');
});

test('missing environment files are valid', (t) => {
  assert.equal(load(fixture(t), 'production'), 'unset');
});

test('CLI resolves the repository root and preserves command exit codes', () => {
  assert.equal(
    workspaceRoot,
    fileURLToPath(new URL('../../../', import.meta.url))
  );
  const result = spawnSync(
    process.execPath,
    [cli, 'test', process.execPath, '-e', 'process.exit(7)'],
    {
      cwd: tmpdir(),
    }
  );
  assert.equal(result.status, 7);
});

test('validation accepts missing services and rejects malformed configuration', () => {
  const environment = { ...process.env };
  for (const name of [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'GITHUB_TOKEN',
  ]) {
    environment[name] = '';
  }
  const args = [
    '--input-type=module',
    '-e',
    `import ${JSON.stringify(
      new URL('../src/index.ts', import.meta.url).href
    )}`,
  ];
  assert.equal(
    spawnSync(process.execPath, args, { env: environment }).status,
    0
  );
  assert.notEqual(
    spawnSync(process.execPath, args, {
      env: { ...environment, DATABASE_URL: 'https://invalid.example.com' },
    }).status,
    0
  );
});

test('server variables cannot be read in browser code', () => {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
        globalThis.window = {};
        const { env } = await import(${JSON.stringify(
          new URL('../src/index.ts', import.meta.url).href
        )});
        try { env.DATABASE_URL; process.exit(2); }
        catch (error) { console.log(error.message); }
      `,
    ],
    { encoding: 'utf8' }
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /server-side environment variable/);
});

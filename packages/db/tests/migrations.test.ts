import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const devUrl = 'postgresql://test:example@dev.invalid/forum';
const prodUrl = 'postgresql://test:example@prod.invalid/forum';

function readConfig(filename: string, overrides: Record<string, string> = {}) {
  const url = new URL(`../${filename}`, import.meta.url).href;
  return spawnSync(
    process.execPath,
    [
      '--import',
      require.resolve('tsx'),
      '--input-type=module',
      '-e',
      `const { default: config } = await import(${JSON.stringify(url)}); console.log(JSON.stringify(config));`,
    ],
    {
      cwd: tmpdir(),
      env: {
        ...process.env,
        DATABASE_URL: 'postgresql://test:example@runtime.invalid/forum',
        DEV_DATABASE_URL: devUrl,
        PROD_DATABASE_URL: prodUrl,
        ...overrides,
      },
      encoding: 'utf8',
    },
  );
}

test('generation has no credentials and resolves schema paths from the package', () => {
  const result = readConfig('drizzle.config.ts');
  assert.equal(result.status, 0, result.stderr);
  const config = JSON.parse(result.stdout);
  assert.equal(config.dbCredentials, undefined);
  assert.equal(
    resolve(tmpdir(), config.schema),
    fileURLToPath(new URL('../src/schema/index.ts', import.meta.url)),
  );
  assert.equal(
    resolve(tmpdir(), config.out),
    fileURLToPath(new URL('../drizzle', import.meta.url)),
  );
});

for (const [stage, variable, url] of [
  ['dev', 'DEV_DATABASE_URL', devUrl],
  ['prod', 'PROD_DATABASE_URL', prodUrl],
]) {
  test(`${stage} config selects only its own database, regardless of cwd`, () => {
    const result = readConfig(`drizzle-${stage}.config.ts`);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout).dbCredentials, { url });
    const missing = readConfig(`drizzle-${stage}.config.ts`, {
      [variable]: '',
    });
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, new RegExp(`Set ${variable}`));
    assert.ok(!missing.stderr.includes('example@'));
  });
}

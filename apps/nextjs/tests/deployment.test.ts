import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const deploymentScript = fileURLToPath(
  new URL('../scripts/vercel-build.mjs', import.meta.url),
);
const commandArgs = (command: string) => [
  '--filter',
  command === 'build' ? '@apps/nextjs' : '@packages/db',
  command,
];

function deployment(
  t: { after: (fn: () => void) => void },
  stage: string,
  failStep = '',
) {
  const cwd = mkdtempSync(join(tmpdir(), 'website-vercel-build-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const callsFile = join(cwd, 'calls.jsonl');
  writeFileSync(callsFile, '');
  writeFileSync(
    join(cwd, 'pnpm'),
    `#!/usr/bin/env node
const { appendFileSync } = require('node:fs');
appendFileSync(process.env.PNPM_CALLS_FILE, JSON.stringify(process.argv.slice(2)) + '\\n');
if (process.argv[4] === process.env.FAIL_STEP) process.exit(7);
`,
    { mode: 0o755 },
  );
  const result = spawnSync(process.execPath, [deploymentScript], {
    cwd,
    env: {
      ...process.env,
      VERCEL_ENV: stage,
      PATH: `${cwd}${delimiter}${process.env.PATH ?? ''}`,
      PNPM_CALLS_FILE: callsFile,
      FAIL_STEP: failStep,
    },
    encoding: 'utf8',
  });
  const calls = readFileSync(callsFile, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  return { ...result, calls };
}

for (const [stage, migration] of [
  ['production', 'db:migrate:prod'],
  ['preview', 'db:migrate:dev'],
  ['development', 'db:migrate:dev'],
]) {
  test(`${stage} deployment migrates the correct database before building`, (t) => {
    const result = deployment(t, stage);
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      result.calls,
      ['db:check', migration, 'build'].map(commandArgs),
    );
  });
}

for (const stage of ['', 'staging', '__proto__']) {
  test(`deployment rejects ${JSON.stringify(
    stage,
  )} before running commands`, (t) => {
    const result = deployment(t, stage);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /VERCEL_ENV must be/);
    assert.deepEqual(result.calls, []);
  });
}

for (const stage of ['production', 'preview']) {
  const commands = [
    'db:check',
    `db:migrate:${stage === 'production' ? 'prod' : 'dev'}`,
    'build',
  ];
  for (const [index, command] of commands.entries()) {
    test(`${stage} deployment stops when ${command} fails`, (t) => {
      const result = deployment(t, stage, command);
      assert.equal(result.status, 7);
      assert.deepEqual(
        result.calls,
        commands.slice(0, index + 1).map(commandArgs),
      );
    });
  }
}

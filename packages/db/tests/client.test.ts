import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { createDb } from '../src/index.ts';

test('constructs schema-aware clients without making network requests', (t) => {
  const previousFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('Unexpected database request');
  };
  t.after(() => {
    globalThis.fetch = previousFetch;
  });
  const schema = {
    example: pgTable('example', { id: text('id').primaryKey() }),
  };
  const db = createDb('postgresql://test:test@database.invalid/test', schema);
  assert.ok(db.query.example);
  assert.equal(typeof db.select, 'function');
});

test('rejects invalid URLs without echoing credentials', () => {
  assert.throws(() => createDb('https://user:private@example.com'), {
    message:
      'A valid PostgreSQL connection URL is required to create a database client.',
  });
});

test('the convenience client is optional until first use and is memoized', () => {
  const moduleUrl = new URL('../src/index.ts', import.meta.url).href;
  const args = [
    '--input-type=module',
    '-e',
    `
      import { getDb } from ${JSON.stringify(moduleUrl)};
      if (!process.env.DATABASE_URL) {
        try { getDb(); process.exit(2); }
        catch (error) { console.log(error.message); }
      } else if (getDb() !== getDb()) { process.exit(3); }
    `,
  ];
  const missing = spawnSync(process.execPath, args, {
    env: { ...process.env, DATABASE_URL: '' },
    encoding: 'utf8',
  });
  assert.equal(missing.status, 0, missing.stderr);
  assert.match(missing.stdout, /Set DATABASE_URL before using the database/);
  const configured = spawnSync(process.execPath, args, {
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://test:test@database.invalid/test',
    },
    encoding: 'utf8',
  });
  assert.equal(configured.status, 0, configured.stderr);
});

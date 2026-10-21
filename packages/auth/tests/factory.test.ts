import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDb } from '@packages/db';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { createAuth } from '../src/index.ts';

const schema = { user: pgTable('test_user', { id: text('id').primaryKey() }) };
const db = createDb('postgresql://test:test@database.invalid/test', schema);
const options = {
  secret: 'test-auth-secret-with-enough-entropy-for-unit-tests-123456',
  baseURL: 'https://one.example.com',
  trustedOrigins: ['https://one.example.com'],
  telemetry: { enabled: false },
  advanced: { database: { validateSchema: false as const } },
};

test('creates separate app instances and preserves plugin and session types', async () => {
  const one = createAuth({
    db,
    schema,
    options: {
      ...options,
      plugins: [
        {
          id: 'example',
          $ERROR_CODES: {
            EXAMPLE: { code: 'EXAMPLE', message: 'Example error' },
          },
        },
      ],
      user: {
        additionalFields: { role: { type: 'string', defaultValue: 'member' } },
      },
    },
  });
  const two = createAuth({
    db,
    schema,
    options: {
      ...options,
      baseURL: 'https://two.example.com',
      trustedOrigins: ['https://two.example.com'],
    },
  });

  assert.notEqual(one, two);
  assert.equal(one.options.baseURL, 'https://one.example.com');
  assert.equal(two.options.baseURL, 'https://two.example.com');
  assert.equal(one.$ERROR_CODES.EXAMPLE.message, 'Example error');
  // This assignment also verifies the factory retains additional session fields.
  const role: typeof one.$Infer.Session.user.role = 'member';
  assert.equal(role, 'member');
  await Promise.all([one.$context, two.$context]);
});

test('requires explicit credentials and auth tables', () => {
  assert.throws(
    () => createAuth({ db, schema, options: { ...options, secret: '' } }),
    /auth secret/
  );
  const unconfiguredDb = createDb(
    'postgresql://test:test@database.invalid/test'
  );
  assert.throws(
    () => createAuth({ db: unconfiguredDb, schema: {}, options }),
    /auth tables/
  );
});

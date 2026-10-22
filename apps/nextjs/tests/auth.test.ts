import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth/minimal';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { authOptions } from '../src/lib/auth-options';
import { authErrorMessage } from '../src/lib/auth-errors';
import * as schema from '@packages/db/schema';
import * as authSchema from '@packages/db/schema/auth';

const origin = 'http://localhost:3000';
const password = ' a real test password! ';

test('authentication with the committed PostgreSQL migrations', async (t) => {
  const postgres = new PGlite();
  t.after(() => postgres.close());
  const db = drizzle({ client: postgres, schema });
  await migrate(db, {
    migrationsFolder: new URL('../../../packages/db/drizzle', import.meta.url)
      .pathname,
  });
  // Applying the migration a second time must be safe.
  await migrate(db, {
    migrationsFolder: new URL('../../../packages/db/drizzle', import.meta.url)
      .pathname,
  });

  const auth = betterAuth({
    ...authOptions,
    baseURL: origin,
    secret: 'test-only-secret-at-least-thirty-two-characters',
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: authSchema,
      transaction: false,
    }),
    logger: { disabled: true },
  });

  function request(
    path: string,
    body?: Record<string, unknown>,
    cookie = '',
    requestOrigin = origin,
  ) {
    return auth.handler(
      new Request(`${origin}/api/auth${path}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          Origin: requestOrigin,
          ...(cookie ? { Cookie: cookie } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
    );
  }

  function cookies(response: Response) {
    return response.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; ');
  }

  const signup = {
    name: 'Community Member',
    username: 'Community.Member_1',
    email: 'member@example.com',
    password,
  };
  let signupCookie = '';

  await t.test(
    'signup persists a normalized username and a hashed password, and signs in',
    async () => {
      const response = await request('/sign-up/email', signup);
      assert.equal(response.status, 200, await response.clone().text());
      const data = await response.json();
      assert.equal(data.user.username, 'community.member_1');
      assert.equal(data.user.displayUsername, signup.username);
      assert.equal(data.user.emailVerified, false);
      signupCookie = cookies(response);
      assert.match(signupCookie, /better-auth\.session_token=/);
      assert.match(response.headers.get('set-cookie') ?? '', /HttpOnly/i);
      const [account] = await db.select().from(schema.account);
      assert.ok(account.password);
      assert.notEqual(account.password, password);
      const session = await (
        await request('/get-session', undefined, signupCookie)
      ).json();
      assert.equal(session.user.username, 'community.member_1');
    },
  );

  await t.test(
    'rejects missing, empty, invalid, and out-of-range usernames through the API',
    async () => {
      for (const username of [
        undefined,
        '',
        'ab',
        'a'.repeat(31),
        'with space',
        'member@example.com',
        'mémber',
      ]) {
        const response = await request('/sign-up/email', {
          ...signup,
          email: 'invalid@example.com',
          username,
        });
        assert.equal(
          response.status,
          400,
          `${String(username)}: ${await response.text()}`,
        );
      }
      assert.equal((await db.select().from(schema.user)).length, 1);
    },
  );

  await t.test(
    'rejects blank names and passwords outside the supported length',
    async () => {
      for (const fields of [
        { name: '  ' },
        { password: 'short' },
        { password: 'a'.repeat(129) },
      ]) {
        const response = await request('/sign-up/email', {
          ...signup,
          username: 'new_member',
          email: 'new@example.com',
          ...fields,
        });
        assert.equal(response.status, 400, await response.text());
      }
    },
  );

  await t.test(
    'rejects duplicate usernames regardless of casing, and duplicate emails',
    async () => {
      const duplicateUsername = await request('/sign-up/email', {
        ...signup,
        email: 'other@example.com',
        username: 'COMMUNITY.MEMBER_1',
      });
      assert.equal(duplicateUsername.status, 400);
      assert.equal(
        (await duplicateUsername.json()).code,
        'USERNAME_IS_ALREADY_TAKEN',
      );
      const duplicateEmail = await request('/sign-up/email', {
        ...signup,
        username: 'other_member',
      });
      assert.equal(duplicateEmail.status, 422);
      assert.equal((await db.select().from(schema.user)).length, 1);
    },
  );

  await t.test(
    'supports email login and username login with different casing',
    async () => {
      for (const [path, identifier] of [
        ['/sign-in/email', { email: signup.email }],
        ['/sign-in/username', { username: 'COMMUNITY.MEMBER_1' }],
      ] as const) {
        const response = await request(path, { ...identifier, password });
        assert.equal(response.status, 200, await response.clone().text());
        const session = await (
          await request('/get-session', undefined, cookies(response))
        ).json();
        assert.equal(session.user.username, 'community.member_1');
      }
    },
  );

  await t.test(
    'rejects incorrect credentials and preserves password whitespace',
    async () => {
      for (const [path, identifier] of [
        ['/sign-in/email', { email: signup.email }],
        ['/sign-in/username', { username: signup.username }],
      ] as const) {
        for (const wrongPassword of ['wrong password', password.trim()]) {
          const response = await request(path, {
            ...identifier,
            password: wrongPassword,
          });
          assert.equal(response.status, 401);
          assert.doesNotMatch(cookies(response), /session_token=/);
        }
      }
    },
  );

  await t.test('rejects an untrusted origin', async () => {
    const response = await request(
      '/sign-in/email',
      { email: signup.email, password },
      '',
      'https://untrusted.example',
    );
    assert.equal(response.status, 403);
  });

  await t.test('logout invalidates the session on the server', async () => {
    const response = await request('/sign-out', {}, signupCookie);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('set-cookie') ?? '', /Max-Age=0/i);
    assert.equal(
      await (await request('/get-session', undefined, signupCookie)).json(),
      null,
    );
  });

  await t.test('expired sessions are rejected', async () => {
    const response = await request('/sign-in/email', {
      email: signup.email,
      password,
    });
    const data = await response.json();
    await db
      .update(schema.session)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(schema.session.token, data.token));
    assert.equal(
      await (
        await request('/get-session', undefined, cookies(response))
      ).json(),
      null,
    );
  });
});

test('auth errors expose safe actionable messages', () => {
  assert.match(authErrorMessage({ status: 503 }), /unavailable/);
  assert.match(authErrorMessage({ status: 429 }), /Too many attempts/);
  assert.match(
    authErrorMessage({ code: 'USERNAME_IS_ALREADY_TAKEN' }),
    /already taken/,
  );
  assert.equal(
    authErrorMessage({ code: 'DATABASE_ERROR_WITH_PRIVATE_DETAILS' }),
    'We could not complete your request. Please try again.',
  );
});

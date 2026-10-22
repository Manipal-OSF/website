import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth/minimal';
import { APIError, createEmailVerificationToken } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { authOptionsWithEmail, type AuthEmail } from '../src/lib/auth-options';
import { authErrorMessage } from '../src/lib/auth-errors';
import { authHref, verificationEmailUrl } from '../src/lib/auth-links';
import {
  trackAuthEmailDelivery,
  withAuthEmailDelivery,
} from '../src/lib/auth-email-status';
import { renderAuthEmail } from '@packages/email/render';
import * as schema from '@packages/db/schema';
import * as authSchema from '@packages/db/schema/auth';

const origin = 'http://localhost:3000';
const password = ' a real test password! ';
const secret = 'test-only-secret-at-least-thirty-two-characters';

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

  const messages: AuthEmail[] = [];
  let failDelivery = false;
  const auth = betterAuth({
    ...authOptionsWithEmail(async (message) => {
      if (failDelivery) {
        throw new APIError('BAD_GATEWAY', {
          code: 'EMAIL_DELIVERY_FAILED',
          message: 'We could not send your email. Please try again.',
        });
      }
      messages.push(message);
    }),
    baseURL: origin,
    secret,
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
    return withAuthEmailDelivery(() =>
      auth.handler(
        new Request(`${origin}/api/auth${path}`, {
          method: body ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json',
            Origin: requestOrigin,
            ...(cookie ? { Cookie: cookie } : {}),
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        }),
      ),
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
    callbackURL: '/forum?view=new',
  };
  let signupCookie = '';

  await t.test(
    'signup persists a normalized username and hashed password, sends verification, and creates no session',
    async () => {
      const response = await request('/sign-up/email', signup);
      assert.equal(response.status, 200, await response.clone().text());
      const data = await response.json();
      assert.equal(data.user.username, 'community.member_1');
      assert.equal(data.user.displayUsername, signup.username);
      assert.equal(data.user.emailVerified, false);
      assert.equal(data.token, null);
      assert.doesNotMatch(cookies(response), /session_token=/);
      assert.equal((await db.select().from(schema.session)).length, 0);
      assert.equal(messages.length, 1);
      assert.equal(messages[0].kind, 'verify-email');
      assert.equal(messages[0].to, signup.email);
      const callback = new URL(
        new URL(messages[0].url).searchParams.get('callbackURL')!,
      );
      assert.equal(callback.origin, origin);
      assert.equal(callback.pathname, '/verify-email');
      assert.equal(callback.searchParams.get('next'), signup.callbackURL);
      assert.equal(callback.searchParams.get('verified'), '1');
      const [account] = await db.select().from(schema.account);
      assert.ok(account.password);
      assert.notEqual(account.password, password);
      const session = await (await request('/get-session')).json();
      assert.equal(session, null);
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
    'rejects duplicate usernames regardless of casing and conceals duplicate emails',
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
      assert.equal(duplicateEmail.status, 200);
      assert.equal((await duplicateEmail.json()).token, null);
      assert.equal((await db.select().from(schema.user)).length, 1);
    },
  );

  await t.test(
    'unverified email and username login are blocked and send verification',
    async () => {
      for (const [path, identifier] of [
        ['/sign-in/email', { email: signup.email }],
        ['/sign-in/username', { username: 'COMMUNITY.MEMBER_1' }],
      ] as const) {
        const count = messages.length;
        const response = await request(path, {
          ...identifier,
          password,
          callbackURL: signup.callbackURL,
        });
        assert.equal(response.status, 403);
        assert.equal((await response.json()).code, 'EMAIL_NOT_VERIFIED');
        assert.doesNotMatch(cookies(response), /session_token=/);
        assert.equal(messages.length, count + 1);
        assert.equal(messages.at(-1)?.kind, 'verify-email');
      }
    },
  );

  await t.test(
    'resends verification without disclosing unknown accounts',
    async () => {
      const count = messages.length;
      const existing = await request('/send-verification-email', {
        email: signup.email,
        callbackURL: signup.callbackURL,
      });
      const unknown = await request('/send-verification-email', {
        email: 'unknown@example.com',
        callbackURL: signup.callbackURL,
      });
      assert.equal(existing.status, 200);
      assert.equal(unknown.status, 200);
      assert.deepEqual(await existing.json(), await unknown.json());
      assert.equal(messages.length, count + 1);
    },
  );

  await t.test(
    'rejects invalid and expired verification links, then verifies without signing in',
    async () => {
      const callbackURL = `${origin}${authHref('/verify-email', signup.callbackURL)}&verified=1`;
      const expired = await createEmailVerificationToken(
        secret,
        signup.email,
        undefined,
        -60,
      );
      for (const [token, code] of [
        ['invalid', 'INVALID_TOKEN'],
        [expired, 'TOKEN_EXPIRED'],
      ]) {
        const response = await request(
          `/verify-email?${new URLSearchParams({ token, callbackURL })}`,
        );
        assert.equal(response.status, 302);
        const target = new URL(response.headers.get('location')!);
        assert.equal(target.searchParams.get('error'), code);
        assert.equal(
          (await db.select().from(schema.user))[0].emailVerified,
          false,
        );
      }
      const response = await auth.handler(new Request(messages.at(-1)!.url));
      assert.equal(response.status, 302);
      assert.equal(
        new URL(response.headers.get('location')!).searchParams.get('next'),
        signup.callbackURL,
      );
      assert.equal(
        (await db.select().from(schema.user))[0].emailVerified,
        true,
      );
      assert.equal((await db.select().from(schema.session)).length, 0);
      assert.doesNotMatch(cookies(response), /session_token=/);
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
        signupCookie = cookies(response);
        assert.match(signupCookie, /better-auth\.session_token=/);
        assert.match(response.headers.get('set-cookie') ?? '', /HttpOnly/i);
        const session = await (
          await request('/get-session', undefined, cookies(response))
        ).json();
        assert.equal(session.user.username, 'community.member_1');
      }
    },
  );

  await t.test(
    'verification resend conceals already-verified accounts and verification is idempotent',
    async () => {
      const count = messages.length;
      const response = await request('/send-verification-email', {
        email: signup.email,
      });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { status: true });
      assert.equal(messages.length, count);
      assert.equal(
        (await auth.handler(new Request(messages[0].url))).status,
        302,
      );
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

  async function requestReset(email = signup.email) {
    return request('/request-password-reset', {
      email,
      redirectTo: authHref('/reset-password', signup.callbackURL),
    });
  }

  function latestResetToken() {
    const message = messages.findLast(
      (message) => message.kind === 'reset-password',
    );
    assert.ok(message);
    return new URL(message.url).pathname.split('/').at(-1)!;
  }

  await t.test(
    'password reset conceals unknown accounts and sends a one-hour recovery link',
    async () => {
      const count = messages.length;
      const known = await requestReset();
      const unknown = await requestReset('unknown@example.com');
      assert.equal(known.status, 200);
      assert.equal(unknown.status, 200);
      assert.deepEqual(await known.json(), await unknown.json());
      assert.equal(messages.length, count + 1);
      const message = messages.at(-1)!;
      assert.equal(message.kind, 'reset-password');
      const response = await auth.handler(new Request(message.url));
      assert.equal(response.status, 302);
      const target = new URL(response.headers.get('location')!);
      assert.equal(target.pathname, '/reset-password');
      assert.equal(target.searchParams.get('next'), signup.callbackURL);
      assert.equal(target.searchParams.get('token'), latestResetToken());
      const [verification] = await db
        .select()
        .from(schema.verification)
        .where(
          eq(
            schema.verification.identifier,
            `reset-password:${latestResetToken()}`,
          ),
        );
      assert.ok(verification.expiresAt.getTime() > Date.now() + 3500_000);
      assert.ok(verification.expiresAt.getTime() <= Date.now() + 3600_000);
    },
  );

  await t.test(
    'rejects invalid and expired reset tokens and unsafe callback origins',
    async () => {
      const invalid = await request('/reset-password', {
        token: 'invalid',
        newPassword: password,
      });
      assert.equal(invalid.status, 400);
      assert.equal((await invalid.json()).code, 'INVALID_TOKEN');
      const token = latestResetToken();
      await db
        .update(schema.verification)
        .set({ expiresAt: new Date(Date.now() - 1000) })
        .where(eq(schema.verification.identifier, `reset-password:${token}`));
      const expiredLink = await auth.handler(new Request(messages.at(-1)!.url));
      assert.equal(
        new URL(expiredLink.headers.get('location')!).searchParams.get('error'),
        'INVALID_TOKEN',
      );
      const expiredReset = await request('/reset-password', {
        token,
        newPassword: password,
      });
      assert.equal(expiredReset.status, 400);
      assert.equal((await expiredReset.json()).code, 'INVALID_TOKEN');
      for (const [path, fields] of [
        [
          '/request-password-reset',
          { redirectTo: 'https://untrusted.example/reset' },
        ],
        [
          '/send-verification-email',
          { callbackURL: 'https://untrusted.example/verify' },
        ],
      ] as const) {
        const response = await request(path, {
          email: signup.email,
          ...fields,
        });
        assert.equal(response.status, 403);
      }
    },
  );

  await t.test(
    'password reset validates length, consumes the token, changes the password, and revokes all sessions',
    async () => {
      const sessions = await Promise.all([
        request('/sign-in/email', { email: signup.email, password }),
        request('/sign-in/username', { username: signup.username, password }),
      ]);
      await requestReset();
      const token = latestResetToken();
      for (const newPassword of ['short', 'a'.repeat(129)]) {
        const response = await request('/reset-password', {
          token,
          newPassword,
        });
        assert.equal(response.status, 400);
      }
      const newPassword = ' a different password! ';
      const response = await request('/reset-password', { token, newPassword });
      assert.equal(response.status, 200, await response.clone().text());
      assert.doesNotMatch(cookies(response), /session_token=/);
      assert.equal((await db.select().from(schema.session)).length, 0);
      for (const session of sessions) {
        assert.equal(
          await (
            await request('/get-session', undefined, cookies(session))
          ).json(),
          null,
        );
      }
      const reuse = await request('/reset-password', {
        token,
        newPassword: password,
      });
      assert.equal(reuse.status, 400);
      assert.equal(
        (await request('/sign-in/email', { email: signup.email, password }))
          .status,
        401,
      );
      for (const [path, identifier] of [
        ['/sign-in/email', { email: signup.email }],
        ['/sign-in/username', { username: signup.username }],
      ] as const) {
        assert.equal(
          (await request(path, { ...identifier, password: newPassword }))
            .status,
          200,
        );
      }
    },
  );

  await t.test(
    'resetting an unverified account does not verify its email',
    async () => {
      const email = 'unverified@example.com';
      assert.equal(
        (
          await request('/sign-up/email', {
            ...signup,
            email,
            username: 'unverified',
          })
        ).status,
        200,
      );
      await requestReset(email);
      const newPassword = 'a new unverified password';
      assert.equal(
        (
          await request('/reset-password', {
            token: latestResetToken(),
            newPassword,
          })
        ).status,
        200,
      );
      const response = await request('/sign-in/email', {
        email,
        password: newPassword,
      });
      assert.equal(response.status, 403);
      assert.equal((await response.json()).code, 'EMAIL_NOT_VERIFIED');
    },
  );

  await t.test(
    'delivery failures return sanitized errors and verification can be retried',
    async () => {
      failDelivery = true;
      const email = 'retry@example.com';
      const signupResponse = await request('/sign-up/email', {
        ...signup,
        email,
        username: 'retry_member',
      });
      assert.equal(signupResponse.status, 502);
      assert.equal((await signupResponse.json()).code, 'EMAIL_DELIVERY_FAILED');
      const resetResponse = await requestReset();
      assert.equal(resetResponse.status, 502);
      assert.equal((await resetResponse.json()).code, 'EMAIL_DELIVERY_FAILED');
      const resendResponse = await request('/send-verification-email', {
        email,
      });
      assert.equal(resendResponse.status, 502);
      failDelivery = false;
      assert.equal(
        (await request('/send-verification-email', { email })).status,
        200,
      );
    },
  );
});

test('auth destinations are preserved and unsafe destinations fall back to the forum', () => {
  const destination = '/forum?view=new&q=hello%20world';
  for (const path of [
    '/login',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ] as const) {
    assert.equal(
      new URL(authHref(path, destination), origin).searchParams.get('next'),
      destination,
    );
    for (const unsafe of [
      'https://evil.example/forum',
      '//evil.example/forum',
      '/login',
      '/forum/../login',
    ]) {
      assert.equal(
        new URL(authHref(path, unsafe), origin).searchParams.get('next'),
        '/forum',
      );
    }
  }
  const link = new URL(
    verificationEmailUrl(
      `${origin}/api/auth/verify-email?token=secret&callbackURL=https://evil.example`,
    ),
  );
  assert.equal(link.searchParams.get('token'), 'secret');
  const callback = new URL(link.searchParams.get('callbackURL')!);
  assert.equal(callback.origin, origin);
  assert.equal(callback.searchParams.get('next'), '/forum');
});

test('email delivery status is isolated between concurrent auth requests and sanitizes errors', async () => {
  const responses = await Promise.all([
    withAuthEmailDelivery(async () => {
      await trackAuthEmailDelivery(async () => {
        throw new Error('private provider details');
      }).catch(() => {});
      return Response.json({ success: true });
    }),
    withAuthEmailDelivery(async () => {
      await trackAuthEmailDelivery(async () => {});
      return Response.json({ success: true });
    }),
    withAuthEmailDelivery(async () => {
      await trackAuthEmailDelivery(async () => {
        throw new APIError('SERVICE_UNAVAILABLE', {
          code: 'EMAIL_UNAVAILABLE',
          message: 'private configuration details',
        });
      }).catch(() => {});
      return Response.json({ success: true });
    }),
  ]);
  assert.deepEqual(
    responses.map((response) => response.status),
    [502, 200, 503],
  );
  for (const response of responses)
    assert.doesNotMatch(await response.text(), /private/);
});

test('React Email templates render escaped HTML and plain text with the action URL', async () => {
  for (const kind of ['verify-email', 'reset-password'] as const) {
    const url = `${origin}/api/auth/${kind}?token=test&callbackURL=%2Fforum`;
    const { html, text } = await renderAuthEmail({
      kind,
      name: '<script>bad</script>',
      url,
    });
    assert.match(html, /&lt;script&gt;bad&lt;\/script&gt;/);
    assert.doesNotMatch(html, /<script>/);
    assert.ok(html.includes(url.replaceAll('&', '&amp;')));
    assert.ok(text.includes(url));
    assert.match(text, /one hour/);
    assert.match(text, /ignore it/);
    assert.match(
      text,
      kind === 'verify-email' ? /Verify email/ : /Reset password/,
    );
  }
});

test('auth errors expose safe actionable messages', () => {
  assert.match(authErrorMessage({ status: 503 }), /unavailable/);
  assert.match(authErrorMessage({ status: 429 }), /Too many attempts/);
  assert.match(
    authErrorMessage({ code: 'EMAIL_NOT_VERIFIED' }),
    /Verify your email/,
  );
  assert.match(
    authErrorMessage({ code: 'EMAIL_DELIVERY_FAILED' }),
    /could not send/,
  );
  assert.match(
    authErrorMessage({ code: 'EMAIL_UNAVAILABLE' }),
    /Email is currently unavailable/,
  );
  assert.match(
    authErrorMessage({ code: 'INVALID_TOKEN' }),
    /invalid or has expired/,
  );
  assert.match(
    authErrorMessage({ code: 'USERNAME_IS_ALREADY_TAKEN' }),
    /already taken/,
  );
  assert.equal(
    authErrorMessage({ code: 'DATABASE_ERROR_WITH_PRIVATE_DETAILS' }),
    'We could not complete your request. Please try again.',
  );
});

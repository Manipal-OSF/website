import 'server-only';
import { createAuth } from '@packages/auth';
import * as schema from '@packages/db/schema/auth';
import { env } from '@packages/env';
import { authOptionsWithEmail } from './auth-options';
import { sendAuthEmail } from './auth-email';
import { getDb } from './db';

export class AuthConfigurationError extends Error {
  constructor() {
    super(
      'Set DATABASE_URL, BETTER_AUTH_SECRET, and BETTER_AUTH_URL to enable authentication.',
    );
  }
}

function createForumAuth() {
  if (!env.DATABASE_URL || !env.BETTER_AUTH_SECRET || !env.BETTER_AUTH_URL) {
    throw new AuthConfigurationError();
  }
  return createAuth({
    db: getDb(),
    schema,
    options: {
      ...authOptionsWithEmail(sendAuthEmail),
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      trustedOrigins: [new URL(env.BETTER_AUTH_URL).origin],
    },
  });
}

let auth: ReturnType<typeof createForumAuth> | undefined;
export function getAuth() {
  return (auth ??= createForumAuth());
}

import type { BetterAuthOptions } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { username } from 'better-auth/plugins';

// Shared with schema generation; credentials and the database belong in auth.ts.
export const authOptions = {
  appName: 'Manipal OSF',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: (value) => /^[a-zA-Z0-9_.]+$/.test(value),
    }),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') return;

      // The username plugin permits omission by default. Every site signup
      // requires a username, including requests made outside the signup form.
      if (typeof ctx.body?.username !== 'string' || !ctx.body.username) {
        throw new APIError('BAD_REQUEST', {
          code: 'USERNAME_REQUIRED',
          message: 'Choose a username.',
        });
      }
      if (typeof ctx.body?.name !== 'string' || !ctx.body.name.trim()) {
        throw new APIError('BAD_REQUEST', {
          code: 'NAME_REQUIRED',
          message: 'Enter your name.',
        });
      }
    }),
  },
} satisfies BetterAuthOptions;

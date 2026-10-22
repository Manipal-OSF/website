import type { BetterAuthOptions } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { username } from 'better-auth/plugins';
import { verificationEmailUrl } from './auth-links';
import { trackAuthEmailDelivery } from './auth-email-status';

// Shared with schema generation; credentials and the database belong in auth.ts.
export const authOptions = {
  appName: 'Manipal OSF',
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 3600,
    revokeSessionsOnPasswordReset: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    expiresIn: 3600,
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

export type AuthEmail = {
  kind: 'verify-email' | 'reset-password';
  to: string;
  name: string;
  url: string;
};

// Keep delivery injectable so integration tests exercise the production options
// without sending mail or needing provider credentials.
export function authOptionsWithEmail(
  send: (email: AuthEmail) => Promise<void>,
) {
  return {
    ...authOptions,
    emailAndPassword: {
      ...authOptions.emailAndPassword,
      sendResetPassword: async ({ user, url }) => {
        await trackAuthEmailDelivery(() =>
          send({
            kind: 'reset-password',
            to: user.email,
            name: user.name,
            url,
          }),
        );
      },
    },
    emailVerification: {
      ...authOptions.emailVerification,
      sendVerificationEmail: async ({ user, url }) => {
        await trackAuthEmailDelivery(() =>
          send({
            kind: 'verify-email',
            to: user.email,
            name: user.name,
            url: verificationEmailUrl(url),
          }),
        );
      },
    },
  } satisfies BetterAuthOptions;
}

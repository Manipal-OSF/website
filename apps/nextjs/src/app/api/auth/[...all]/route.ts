import { toNextJsHandler } from 'better-auth/next-js';
import { APIError } from 'better-auth/api';
import { AuthConfigurationError, getAuth } from '@/lib/auth';
import { assertEmailConfigured } from '@/lib/auth-email';
import { withAuthEmailDelivery } from '@/lib/auth-email-status';

export const runtime = 'nodejs';

async function handleAuth(request: Request) {
  try {
    const handlers = toNextJsHandler(getAuth());
    // Check before looking up an email address, so configuration failures don't
    // reveal whether a password-reset or resend recipient has an account.
    if (
      request.method === 'POST' &&
      [
        '/sign-up/email',
        '/request-password-reset',
        '/send-verification-email',
      ].some((path) =>
        new URL(request.url).pathname.replace(/\/$/, '').endsWith(path),
      )
    ) {
      assertEmailConfigured();
    }
    return await withAuthEmailDelivery(() =>
      handlers[request.method === 'GET' ? 'GET' : 'POST'](request),
    );
  } catch (error) {
    if (error instanceof APIError && error.body?.code === 'EMAIL_UNAVAILABLE') {
      return Response.json(error.body, {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      });
    }
    const unavailable = error instanceof AuthConfigurationError;
    if (!unavailable) console.error('Authentication request failed.');

    return Response.json(
      {
        code: unavailable ? 'AUTH_UNAVAILABLE' : 'AUTH_REQUEST_FAILED',
        message: unavailable
          ? 'Authentication is currently unavailable. Please try again later.'
          : 'We could not complete your request. Please try again.',
      },
      {
        status: unavailable ? 503 : 500,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}

export { handleAuth as GET, handleAuth as POST };

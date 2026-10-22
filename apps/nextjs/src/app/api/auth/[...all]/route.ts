import { toNextJsHandler } from 'better-auth/next-js';
import { AuthConfigurationError, getAuth } from '@/lib/auth';

export const runtime = 'nodejs';

async function handleAuth(request: Request) {
  try {
    const handlers = toNextJsHandler(getAuth());
    return await handlers[request.method === 'GET' ? 'GET' : 'POST'](request);
  } catch (error) {
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

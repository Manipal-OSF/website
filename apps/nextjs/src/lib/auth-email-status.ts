import { AsyncLocalStorage } from 'node:async_hooks';
import { APIError } from 'better-auth/api';

// Better Auth deliberately catches failures in signup/reset email callbacks.
// Keep a request-local result so those operations can report delivery failure
// without altering the library or sharing state between concurrent requests.
const delivery = new AsyncLocalStorage<{
  failure?: 'EMAIL_UNAVAILABLE' | 'EMAIL_DELIVERY_FAILED';
}>();

export async function trackAuthEmailDelivery(send: () => Promise<void>) {
  try {
    await send();
  } catch (error) {
    const result = delivery.getStore();
    if (result) {
      result.failure =
        error instanceof APIError && error.body?.code === 'EMAIL_UNAVAILABLE'
          ? 'EMAIL_UNAVAILABLE'
          : 'EMAIL_DELIVERY_FAILED';
    }
    throw error;
  }
}

export function withAuthEmailDelivery(handler: () => Promise<Response>) {
  return delivery.run({}, async () => {
    const response = await handler();
    const failure = delivery.getStore()?.failure;
    if (!failure) return response;
    const unavailable = failure === 'EMAIL_UNAVAILABLE';
    return Response.json(
      {
        code: failure,
        message: unavailable
          ? 'Email is currently unavailable. Please try again later.'
          : 'We could not send your email. Please try again.',
      },
      {
        status: unavailable ? 503 : 502,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  });
}

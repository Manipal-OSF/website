import 'server-only';
import { APIError } from 'better-auth/api';
import { Resend } from 'resend';
import { renderAuthEmail } from '@packages/email/render';
import { env } from '@packages/env';
import type { AuthEmail } from './auth-options';

let resend: Resend | undefined;

export function assertEmailConfigured() {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    throw new APIError('SERVICE_UNAVAILABLE', {
      code: 'EMAIL_UNAVAILABLE',
      message: 'Email is currently unavailable. Please try again later.',
    });
  }
}

export async function sendAuthEmail(email: AuthEmail) {
  assertEmailConfigured();
  try {
    resend ??= new Resend(env.RESEND_API_KEY);
    const content = await renderAuthEmail(email);
    const { error } = await resend.emails.send({
      from: `Manipal OSF <${env.RESEND_FROM_EMAIL}>`,
      to: email.to,
      subject:
        email.kind === 'verify-email'
          ? 'Verify your Manipal OSF email'
          : 'Reset your Manipal OSF password',
      ...content,
    });
    if (error) throw new Error('Email delivery failed.');
  } catch {
    // Never expose recipient details, tokens, credentials, or provider responses.
    throw new APIError('BAD_GATEWAY', {
      code: 'EMAIL_DELIVERY_FAILED',
      message: 'We could not send your email. Please try again.',
    });
  }
}

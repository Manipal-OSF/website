import 'server-only';
import { Resend } from 'resend';
import { env } from './env';

let resend: Resend | undefined;

export function getResend(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error('Set RESEND_API_KEY before using Resend.');
  }

  resend ??= new Resend(env.RESEND_API_KEY);
  return resend;
}

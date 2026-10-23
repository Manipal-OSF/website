'use client';

import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { authErrorMessage } from '@/lib/auth-errors';
import { authHref } from '@/lib/auth-links';
import { safeForumReturn } from '@/lib/forum-validation';

const inputClassName =
  'border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3 disabled:opacity-50';

export default function AuthRecoveryForm({
  mode,
  returnTo,
  token,
  linkError,
  verified = false,
  sent = false,
}: {
  mode: 'verify' | 'forgot' | 'reset';
  returnTo?: string;
  token?: string;
  linkError?: string;
  verified?: boolean;
  sent?: boolean;
}) {
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [requested, setRequested] = useState(false);
  const reset = mode === 'reset';
  const verification = mode === 'verify';
  const invalidReset = reset && (!token || !!linkError);
  const success = complete || (verification && verified && !linkError);
  const title = verification
    ? success
      ? 'Email verified'
      : 'Verify your email'
    : reset
      ? success
        ? 'Password updated'
        : 'Reset your password'
      : 'Forgot your password?';
  const statusMessage = requested
    ? verification
      ? 'If this email belongs to an unverified account, a verification link has been sent. Check your inbox and spam folder.'
      : 'If an account exists with this email, a password reset link has been sent. Check your inbox and spam folder.'
    : verification && sent
      ? 'Check your inbox and spam folder for your verification link. You must verify your email before logging in.'
      : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const values = new FormData(event.currentTarget);
    const password = String(values.get('password') ?? '');
    setError(null);
    if (reset && password !== String(values.get('confirmPassword') ?? '')) {
      setError('Your passwords do not match.');
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const email = String(values.get('email') ?? '').trim();
      const result = reset
        ? await authClient.resetPassword({ token, newPassword: password })
        : verification
          ? await authClient.sendVerificationEmail({
              email,
              callbackURL: safeForumReturn(returnTo),
            })
          : await authClient.requestPasswordReset({
              email,
              redirectTo: authHref('/reset-password', returnTo),
            });
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      if (reset) {
        setComplete(true);
        // Refresh the header's session after the server revokes all sessions.
        authClient.$store.notify('$sessionSignal');
      } else {
        setRequested(true);
      }
    } catch {
      setError(
        'We could not connect. Please check your connection and try again.',
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <section
      className='bg-card mx-auto my-6 w-full max-w-md rounded-xl border p-5 sm:p-8'
      aria-labelledby='recovery-heading'
    >
      <h1 id='recovery-heading' className='text-2xl font-semibold'>
        {title}
      </h1>
      {success ? (
        <p role='status' className='text-muted-foreground mt-3 text-sm'>
          {verification
            ? 'Your email is verified. You can now log in.'
            : 'Your password has been updated and your previous sessions have been logged out. Log in with your new password. If your email is unverified, you will still need to verify it.'}
        </p>
      ) : invalidReset ? (
        <p role='alert' className='text-destructive mt-3 text-sm'>
          This reset link is invalid or has expired. Request a new password
          reset link.
        </p>
      ) : (
        <>
          <p className='text-muted-foreground mt-2 text-sm'>
            {verification
              ? 'Enter your account email to request a verification link.'
              : reset
                ? 'Choose a new password with 8–128 characters.'
                : 'Enter your account email and we’ll send you a password reset link.'}
          </p>
          {verification && linkError && !requested && (
            <p role='alert' className='text-destructive mt-3 text-sm'>
              This verification link is invalid or has expired. Request a new
              one below.
            </p>
          )}
          <form
            onSubmit={handleSubmit}
            className='mt-6 flex flex-col gap-4'
            aria-busy={busy}
            aria-describedby={error ? 'recovery-error' : undefined}
          >
            <fieldset disabled={busy} className='flex min-w-0 flex-col gap-4'>
              <legend className='sr-only'>
                {reset ? 'New password' : 'Account email'}
              </legend>
              {reset ? (
                <>
                  <div className='flex flex-col gap-2'>
                    <label htmlFor='password' className='text-sm font-medium'>
                      New password
                    </label>
                    <input
                      id='password'
                      name='password'
                      type='password'
                      autoComplete='new-password'
                      minLength={8}
                      maxLength={128}
                      required
                      className={inputClassName}
                    />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <label
                      htmlFor='confirmPassword'
                      className='text-sm font-medium'
                    >
                      Confirm new password
                    </label>
                    <input
                      id='confirmPassword'
                      name='confirmPassword'
                      type='password'
                      autoComplete='new-password'
                      minLength={8}
                      maxLength={128}
                      required
                      className={inputClassName}
                    />
                  </div>
                </>
              ) : (
                <div className='flex flex-col gap-2'>
                  <label htmlFor='email' className='text-sm font-medium'>
                    Email
                  </label>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    autoCapitalize='none'
                    spellCheck={false}
                    required
                    className={inputClassName}
                  />
                </div>
              )}
              <Button type='submit' size='lg' className='mt-1 w-full'>
                {busy
                  ? 'Please wait…'
                  : reset
                    ? 'Update password'
                    : verification
                      ? 'Send verification email'
                      : 'Send reset link'}
              </Button>
            </fieldset>
            <div className='text-sm' aria-live='polite' aria-atomic='true'>
              {error && (
                <p
                  id='recovery-error'
                  role='alert'
                  className='text-destructive'
                >
                  {error}
                </p>
              )}
              {statusMessage && (
                <p role='status' className='text-muted-foreground'>
                  {statusMessage}
                </p>
              )}
            </div>
          </form>
        </>
      )}
      <div className='mt-5 flex flex-col gap-3 text-sm'>
        <Link href={authHref('/login', returnTo)} className='text-primary'>
          Back to login
        </Link>
        {reset && (
          <Link
            href={authHref('/forgot-password', returnTo)}
            className='text-primary'
          >
            Request a new password reset link
          </Link>
        )}
        {reset && success && (
          <Link
            href={authHref('/verify-email', returnTo)}
            className='text-primary'
          >
            Request a verification email
          </Link>
        )}
      </div>
    </section>
  );
}

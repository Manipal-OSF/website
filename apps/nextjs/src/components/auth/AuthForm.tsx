'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { authErrorMessage } from '@/lib/auth-errors';
import { safeForumReturn } from '@/lib/forum-validation';

const inputClassName =
  'border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3 disabled:opacity-50';

export default function AuthForm({
  mode,
  returnTo,
}: {
  mode: 'login' | 'signup';
  returnTo?: string;
}) {
  const signup = mode === 'signup';
  const router = useRouter();
  const destination = safeForumReturn(returnTo);
  const {
    data: session,
    isPending,
    error: sessionError,
  } = authClient.useSession();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const message =
    error ?? (sessionError ? authErrorMessage(sessionError) : null);

  useEffect(() => {
    if (session) router.replace(destination);
  }, [router, session, destination]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || isPending || session) return;

    const values = new FormData(event.currentTarget);
    const password = String(values.get('password') ?? '');
    submitting.current = true;
    setBusy(true);
    setError(null);

    try {
      let result;
      if (signup) {
        result = await authClient.signUp.email({
          name: String(values.get('name') ?? '').trim(),
          username: String(values.get('username') ?? '').trim(),
          email: String(values.get('email') ?? '').trim(),
          password,
        });
      } else {
        const identifier = String(values.get('identifier') ?? '').trim();
        result = identifier.includes('@')
          ? await authClient.signIn.email({ email: identifier, password })
          : await authClient.signIn.username({
              username: identifier,
              password,
            });
      }

      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }

      router.replace(destination);
      router.refresh();
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
      aria-labelledby='auth-heading'
    >
      <h1 id='auth-heading' className='text-2xl font-semibold'>
        {signup ? 'Create an account' : 'Log in'}
      </h1>
      <p className='text-muted-foreground mt-2 text-sm'>
        {signup
          ? 'Join the Manipal OSF community.'
          : 'Welcome back to Manipal OSF.'}
      </p>

      <form
        onSubmit={handleSubmit}
        className='mt-6 flex flex-col gap-4'
        aria-busy={busy || isPending}
        aria-describedby={message ? 'auth-error' : undefined}
      >
        <fieldset
          disabled={busy || isPending || !!session}
          className='flex min-w-0 flex-col gap-4'
        >
          <legend className='sr-only'>
            {signup ? 'Signup details' : 'Login details'}
          </legend>
          {signup ? (
            <>
              <div className='flex flex-col gap-2'>
                <label htmlFor='name' className='text-sm font-medium'>
                  Name
                </label>
                <input
                  id='name'
                  name='name'
                  autoComplete='name'
                  required
                  className={inputClassName}
                />
              </div>
              <div className='flex flex-col gap-2'>
                <label htmlFor='username' className='text-sm font-medium'>
                  Username
                </label>
                <input
                  id='username'
                  name='username'
                  autoComplete='username'
                  autoCapitalize='none'
                  spellCheck={false}
                  required
                  minLength={3}
                  maxLength={30}
                  pattern='[a-zA-Z0-9_.]{3,30}'
                  aria-describedby='username-help'
                  className={inputClassName}
                />
                <p id='username-help' className='text-muted-foreground text-xs'>
                  3–30 letters, numbers, underscores, or dots. Usernames are
                  case-insensitive.
                </p>
              </div>
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
            </>
          ) : (
            <div className='flex flex-col gap-2'>
              <label htmlFor='identifier' className='text-sm font-medium'>
                Email or username
              </label>
              <input
                id='identifier'
                name='identifier'
                autoComplete='username'
                autoCapitalize='none'
                spellCheck={false}
                required
                className={inputClassName}
              />
            </div>
          )}
          <div className='flex flex-col gap-2'>
            <label htmlFor='password' className='text-sm font-medium'>
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              autoComplete={signup ? 'new-password' : 'current-password'}
              required
              minLength={8}
              maxLength={128}
              aria-describedby={signup ? 'password-help' : undefined}
              className={inputClassName}
            />
            {signup && (
              <p id='password-help' className='text-muted-foreground text-xs'>
                Use 8–128 characters.
              </p>
            )}
          </div>
          <Button type='submit' size='lg' className='mt-1 w-full'>
            {busy
              ? signup
                ? 'Creating account…'
                : 'Logging in…'
              : signup
                ? 'Sign up'
                : 'Log in'}
          </Button>
        </fieldset>
        <div className='text-sm' aria-live='polite' aria-atomic='true'>
          {isPending ? (
            <p className='text-muted-foreground'>Checking your session…</p>
          ) : session ? (
            <p className='text-muted-foreground'>Taking you to the forum…</p>
          ) : message ? (
            <p id='auth-error' role='alert' className='text-destructive'>
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

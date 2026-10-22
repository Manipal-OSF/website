'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { authErrorMessage } from '@/lib/auth-errors';

export default function AuthNav() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(null);

    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(authErrorMessage(result.error));
        return;
      }
      router.replace('/forum');
      router.refresh();
    } catch {
      setError('Could not log out. Please try again.');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  if (isPending) {
    return (
      <span role='status' className='text-muted-foreground px-2 text-xs'>
        Checking session…
      </span>
    );
  }

  return (
    <div className='relative flex min-w-0 items-center gap-1 sm:gap-2'>
      {session ? (
        <>
          <span
            className='max-w-24 truncate text-xs sm:max-w-36 sm:text-sm'
            title={`@${session.user.displayUsername || session.user.username}`}
          >
            @{session.user.displayUsername || session.user.username}
          </span>
          <Button variant='ghost' size='sm' disabled={busy} onClick={signOut}>
            {busy ? 'Logging out…' : 'Logout'}
          </Button>
        </>
      ) : null}
      {error && (
        <p
          role='alert'
          className='bg-background text-destructive absolute top-full right-0 mt-2 w-64 rounded-lg border p-3 text-sm shadow-sm'
        >
          {error}
        </p>
      )}
    </div>
  );
}

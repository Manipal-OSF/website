'use client';

import {
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { forumAction } from '@/app/(forum)/actions';
import { Button } from '@/components/ui/button';

export default function ForumForm({
  children,
  action,
  fields = {},
  label = 'Save',
  onSuccess,
  confirmMessage,
}: {
  children?: ReactNode;
  action: string;
  fields?: Record<string, string>;
  label?: string;
  onSuccess?: () => void;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ error?: string; success?: string }>(
    {},
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      submitting.current ||
      (confirmMessage && !window.confirm(confirmMessage))
    )
      return;
    const data = new FormData(event.currentTarget);
    submitting.current = true;
    setMessage({});
    startTransition(async () => {
      try {
        const result = await forumAction(data);
        setMessage(result);
        if (!result.error) {
          formRef.current?.reset();
          onSuccess?.();
          if (result.location) router.push(result.location);
          router.refresh();
        }
      } catch {
        setMessage({
          error: 'Could not connect. Your draft is still here. Try again.',
        });
      } finally {
        submitting.current = false;
      }
    });
  }
  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className='forum-form'
      aria-busy={pending}
    >
      <input type='hidden' name='action' value={action} />
      {Object.entries(fields).map(([key, value]) => (
        <input key={key} type='hidden' name={key} value={value} />
      ))}
      <fieldset disabled={pending} className='min-w-0 space-y-3'>
        {children}
        <Button type='submit' size='sm' variant='outline'>
          {pending ? 'Saving…' : label}
        </Button>
      </fieldset>
      {message.error && (
        <p role='alert' className='text-destructive mt-2 text-xs'>
          {message.error}
        </p>
      )}
      {message.success && (
        <p role='status' className='text-muted-foreground mt-2 text-xs'>
          {message.success}
        </p>
      )}
    </form>
  );
}

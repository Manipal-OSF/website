import type { Metadata } from 'next';
import AuthRecoveryForm from '@/components/auth/AuthRecoveryForm';

export const metadata: Metadata = {
  title: 'Reset password',
  robots: { index: false, follow: true },
  referrer: 'no-referrer',
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; token?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthRecoveryForm
      mode='reset'
      returnTo={params.next}
      token={params.token}
      linkError={params.error}
    />
  );
}

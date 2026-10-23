import type { Metadata } from 'next';
import AuthRecoveryForm from '@/components/auth/AuthRecoveryForm';

export const metadata: Metadata = {
  title: 'Verify your email',
  robots: { index: false, follow: true },
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
    error?: string;
    verified?: string;
    sent?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <AuthRecoveryForm
      mode='verify'
      returnTo={params.next}
      linkError={params.error}
      verified={params.verified === '1'}
      sent={params.sent === '1'}
    />
  );
}

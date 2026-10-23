import type { Metadata } from 'next';
import AuthRecoveryForm from '@/components/auth/AuthRecoveryForm';

export const metadata: Metadata = {
  title: 'Forgot password',
  robots: { index: false, follow: true },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <AuthRecoveryForm mode='forgot' returnTo={(await searchParams).next} />
  );
}

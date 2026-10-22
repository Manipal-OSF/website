import React from 'react';
import AuthEmailLayout, {
  type AuthEmailProps,
} from '../components/auth-layout';

export default function VerifyEmail(props: AuthEmailProps) {
  return (
    <AuthEmailLayout
      {...props}
      title='Verify your email address'
      description='Confirm your email address to log in and join the Manipal OSF community.'
      action='Verify email'
    />
  );
}

VerifyEmail.PreviewProps = {
  name: 'OSF member',
  url: 'https://forum.example.com/api/auth/verify-email?token=preview',
} satisfies AuthEmailProps;

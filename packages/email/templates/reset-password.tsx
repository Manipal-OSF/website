import React from 'react';
import AuthEmailLayout, {
  type AuthEmailProps,
} from '../components/auth-layout';

export default function ResetPasswordEmail(props: AuthEmailProps) {
  return (
    <AuthEmailLayout
      {...props}
      title='Reset your password'
      description='Use the link below to choose a new password for your Manipal OSF account. Your password will stay the same until you complete this step.'
      action='Reset password'
    />
  );
}

ResetPasswordEmail.PreviewProps = {
  name: 'OSF member',
  url: 'https://forum.manipalosf.org/api/auth/reset-password/preview?callbackURL=%2Freset-password',
} satisfies AuthEmailProps;

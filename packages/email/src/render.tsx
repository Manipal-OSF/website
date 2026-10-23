import React from 'react';
import { render, toPlainText } from 'react-email';
import VerifyEmail from '../templates/verify-email';
import ResetPasswordEmail from '../templates/reset-password';

export async function renderAuthEmail({
  kind,
  name,
  url,
}: {
  kind: 'verify-email' | 'reset-password';
  name: string;
  url: string;
}) {
  const html = await render(
    kind === 'verify-email' ? (
      <VerifyEmail name={name} url={url} />
    ) : (
      <ResetPasswordEmail name={name} url={url} />
    ),
  );
  return { html, text: toPlainText(html) };
}

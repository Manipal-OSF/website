import React from 'react';
import { Button, Heading, Link, Text } from 'react-email';
import EmailLayout, { emailColors } from './email-layout';

export type AuthEmailProps = { name?: string; url: string };

export default function AuthEmailLayout({
  name = 'there',
  url,
  title,
  description,
  action,
}: AuthEmailProps & { title: string; description: string; action: string }) {
  return (
    <EmailLayout preview={`${title} — Manipal OSF`}>
      <Heading className='email-text'>{title}</Heading>
      <Text className='email-text'>Hello, {name}!</Text>
      <Text className='email-text'>{description}</Text>
      <Button
        className='email-button'
        href={url}
        style={{
          backgroundColor: emailColors.light.accent,
          borderRadius: '6px',
          color: emailColors.light.buttonText,
          padding: '12px 20px',
          fontWeight: 'bold',
        }}
      >
        {action}
      </Button>
      <Text className='email-text'>This link expires in one hour.</Text>
      <Text className='email-text'>
        If the button doesn’t work, copy and paste this URL into your browser:
      </Text>
      <Link
        className='email-accent'
        href={url}
        style={{ color: emailColors.light.accent, wordBreak: 'break-all' }}
      >
        {url}
      </Link>
      <Text
        className='email-muted'
        style={{ color: emailColors.light.muted, fontSize: '12px' }}
      >
        If you didn’t request this email, you can safely ignore it.
      </Text>
    </EmailLayout>
  );
}

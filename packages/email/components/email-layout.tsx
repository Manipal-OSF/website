import React, { type ReactNode } from 'react';
import { Body, Container, Head, Html, Preview, Text } from 'react-email';

// Match the website's Nord light and Catppuccin Mocha dark palettes. Inline
// light colors remain the fallback when a mail client strips embedded styles.
export const emailColors = {
  light: {
    background: '#eceff4',
    card: '#e5e9f0',
    text: '#2e3440',
    muted: '#4c566a',
    border: '#d8dee9',
    accent: '#5e81ac',
    buttonText: '#eceff4',
  },
  dark: {
    background: '#1e1e2e',
    card: '#181825',
    text: '#cdd6f4',
    muted: '#a6adc8',
    border: '#313244',
    accent: '#cba6f7',
    buttonText: '#11111b',
  },
};

const darkRules = [
  [
    '.email-body',
    `background-color: ${emailColors.dark.background} !important; color: ${emailColors.dark.text} !important;`,
  ],
  [
    '.email-body > table > tbody > tr > td',
    `background-color: ${emailColors.dark.background} !important; color: ${emailColors.dark.text} !important;`,
  ],
  [
    '.email-card',
    `background-color: ${emailColors.dark.card} !important; border-color: ${emailColors.dark.border} !important; color: ${emailColors.dark.text} !important;`,
  ],
  ['.email-text', `color: ${emailColors.dark.text} !important;`],
  ['.email-muted', `color: ${emailColors.dark.muted} !important;`],
  ['.email-accent', `color: ${emailColors.dark.accent} !important;`],
  [
    '.email-button',
    `background-color: ${emailColors.dark.accent} !important; color: ${emailColors.dark.buttonText} !important;`,
  ],
] as const;

function darkStyles(prefix = '') {
  return darkRules
    .map(
      ([selector, declarations]) => `${prefix}${selector} { ${declarations} }`,
    )
    .join('\n');
}

export default function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang='en'>
      <Head>
        <meta name='color-scheme' content='light dark' />
        <meta name='supported-color-schemes' content='light dark' />
        <style>{`
          :root { color-scheme: light dark; supported-color-schemes: light dark; }
          @media (prefers-color-scheme: dark) { ${darkStyles()} }
          ${darkStyles('[data-ogsc] ')}
          ${darkStyles('[data-ogsb] ')}
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className='email-body'
        style={{
          backgroundColor: emailColors.light.background,
          color: emailColors.light.text,
          fontFamily: 'Arial, sans-serif',
          margin: '0',
          padding: '32px 16px',
        }}
      >
        <Container
          className='email-card'
          style={{
            backgroundColor: emailColors.light.card,
            border: `1px solid ${emailColors.light.border}`,
            borderRadius: '12px',
            color: emailColors.light.text,
            maxWidth: '560px',
            margin: '0 auto',
            padding: '32px',
          }}
        >
          <Text
            className='email-accent'
            style={{ color: emailColors.light.accent, fontWeight: 'bold' }}
          >
            Manipal OSF
          </Text>
          {children}
        </Container>
      </Body>
    </Html>
  );
}

import { ImageResponse } from 'next/og';
import Logo from '@/components/layout/Logo';
import { siteName } from './site';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

const colors = {
  background: '#1e1e2e',
  foreground: '#cdd6f4',
  muted: '#a6adc8',
  primary: '#cba6f7',
  border: '#313244',
};

interface OgImageProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function ogImage({ eyebrow, title, subtitle }: OgImageProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: colors.background,
          color: colors.foreground,
          borderBottom: `12px solid ${colors.primary}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Logo width={72} height={72} fill={colors.primary} />
          <span style={{ fontSize: 36, fontWeight: 600 }}>{siteName}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {eyebrow && (
            <span style={{ fontSize: 28, color: colors.primary }}>
              {eyebrow}
            </span>
          )}
          <span
            style={{
              fontSize: title.length > 60 ? 56 : 68,
              fontWeight: 600,
              lineHeight: 1.15,
              lineClamp: 3,
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span style={{ fontSize: 28, color: colors.muted, lineClamp: 2 }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    ),
    ogSize
  );
}

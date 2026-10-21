import fontData from '../assets/NotoSans-Regular.ttf?inline';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { siteName } from './site';

export const ogSize = { width: 1200, height: 630 };
const font = Buffer.from(fontData.split(',')[1], 'base64');
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!,
  );
export async function ogImage({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const logo = `<path d='M102.8 343.5c0-109.2 88.8-197.7 198.3-197.7s198.3 88.5 198.3 197.7c0 4.3-.2 8.5-.4 12.7a224.773 224.773 0 0 0 5.3-48.9c0-118.6-90.9-214.7-203.1-214.7S97.9 188.7 97.9 307.3a224.773 224.773 0 0 0 5.3 48.9c-.3-4.2-.4-8.5-.4-12.7ZM462.8 427.3c-20.4-3.2-45.1-3.6-70.6 6.6-51.7 20.2-87.8 75.8-91.2 72.6-.6-.6.2-2.2.6-3 5.4-12.5 29.8-61.4 65.5-86.7 8.1-5.6 16.9-10.9 16.9-10.9s8.1-4.7 16.5-8.8c12.4-6 47-16.5 94.5-22.8' /><path d='M485.4 502.4a240.41 240.41 0 0 0-62.5-11.6c-67-3.7-120 19.8-121.3 15.5-.7-2.4 16.5-10.5 34.8-18.9 34.3-15.9 60.7-27.9 97.9-34.6 10.5-1.9 18.5-2.8 25.8-3.6a445.124 445.124 0 0 1 70-2.2M137.2 427.9c20.4-3.2 45.1-3.6 70.6 6.6 51.7 20.2 87.8 75.8 91.2 72.6.6-.6-.2-2.2-.6-3-5.4-12.5-29.8-61.4-65.5-86.7-8.1-5.6-16.9-10.9-16.9-10.9s-8.1-4.7-16.5-8.8c-12.4-6-47-16.5-94.5-22.8' /><path d='M114.6 503a240.41 240.41 0 0 1 62.5-11.6c67-3.7 120 19.8 121.3 15.5.7-2.4-16.5-10.5-34.8-18.9-34.3-15.9-60.7-27.9-97.9-34.6-10.5-1.9-18.5-2.8-25.8-3.6a445.123 445.123 0 0 0-70-2.2' />`;
  const markup =
    html(`<div style="width:100%;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:72px;background:#1e1e2e;color:#cdd6f4;border-bottom:12px solid #cba6f7;font-family:Noto Sans;">
    <div style="display:flex;align-items:center;gap:20px"><svg width="72" height="72" viewBox="0 0 600 600" fill="#cba6f7">${logo}</svg><span style="font-size:36px">${escapeHtml(siteName)}</span></div>
    <div style="display:flex;flex-direction:column;gap:20px">${eyebrow ? `<span style="font-size:28px;color:#cba6f7">${escapeHtml(eyebrow)}</span>` : ''}<span style="font-size:${title.length > 60 ? 56 : 68}px;line-height:1.15;line-clamp:3">${escapeHtml(title)}</span>${subtitle ? `<span style="font-size:28px;color:#a6adc8;line-clamp:2">${escapeHtml(subtitle)}</span>` : ''}</div>
  </div>`);
  const svg = await satori(markup as unknown as Parameters<typeof satori>[0], {
    ...ogSize,
    fonts: [{ name: 'Noto Sans', data: font, weight: 400, style: 'normal' }],
  });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}

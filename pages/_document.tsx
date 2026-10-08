import { Html, Head, Main, NextScript } from 'next/document';

const themeScript = `
(function () {
  try {
    localStorage.removeItem('theme');
    var t = sessionStorage.getItem('theme');
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

export default function Document() {
return (
<Html lang='en' suppressHydrationWarning>
<Head>
<link rel='icon' href='/logo.png' type='image/png' />
</Head>
<body className='bg-background text-foreground'>
<script dangerouslySetInnerHTML={{ __html: themeScript }} />
<Main />
<NextScript />
</body>
</Html>
  );
}
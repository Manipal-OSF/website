import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const output = new URL('../.vercel/output/', import.meta.url);
const config = JSON.parse(
  await readFile(new URL('config.json', output), 'utf8'),
);
const isr = JSON.parse(
  await readFile(
    new URL('functions/_isr.prerender-config.json', output),
    'utf8',
  ),
);
assert.equal(isr.expiration, 3600);
assert.equal(isr.exposeErrBody, true);
assert.equal(config.overrides['opengraph-image'].contentType, 'image/png');
const functionDir = new URL('functions/_isr.func/', output);
const { handler } = JSON.parse(
  await readFile(new URL('.vc-config.json', functionDir), 'utf8'),
);
const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
try {
  // Exercise the packaged dependency graph without live GitHub credentials or
  // network access. Offline pages must remain renderable and must not be cached.
  globalThis.fetch = async (input, init) => {
    const url = new URL(
      typeof input === 'string' || input instanceof URL ? input : input.url,
    );
    if (url.hostname === 'api.github.com')
      return new Response(null, { status: 403 });
    return originalFetch(input, init);
  };
  console.warn = () => {};
  const { default: app } = await import(new URL(handler, functionDir).href);
  for (const path of ['/', '/team']) {
    const response = await app.fetch(
      new Request(`https://manipalosf.org${path}`),
    );
    assert.equal(
      response.status,
      503,
      `${path}: packaged function failed to render offline`,
    );
    assert.match(response.headers.get('cache-control'), /no-store/);
    const html = await response.text();
    assert.ok(
      html.includes(
        path === '/' ? 'statistics are unavailable' : 'Established since',
      ),
    );
  }
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
}
console.log(
  'Verified packaged Vercel functions, offline responses, hourly ISR, and PNG content types.',
);

import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';

// Vercel reads Build Output API artifacts from the project root. The Astro
// adapter writes inside its workspace, so promote its complete output here.
const source = new URL('../apps/astro/.vercel/output/', import.meta.url);
const destination = new URL('../.vercel/output/', import.meta.url);
const config = JSON.parse(
  await readFile(new URL('config.json', source), 'utf8'),
);
const rootConfig = JSON.parse(
  await readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
);
const imageHeaders = { 'Content-Type': 'image/png' };
config.overrides ??= {};
config.overrides['opengraph-image'] = { contentType: 'image/png' };
for (const id of await readdir(new URL('static/blog/', source), {
  withFileTypes: true,
})) {
  if (id.isDirectory())
    config.overrides[`blog/${id.name}/opengraph-image`] = {
      contentType: 'image/png',
    };
}
config.routes.unshift(
  { src: '^/.*$', headers: { 'X-DNS-Prefetch-Control': 'on' }, continue: true },
  {
    src: '^/(?:blog/[^/]+/)?opengraph-image$',
    headers: imageHeaders,
    continue: true,
  },
  ...rootConfig.redirects.map(({ source: path, destination: location }) => ({
    src: `^${path}$`,
    headers: { Location: location },
    status: 307,
  })),
);
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
// Preserve pnpm's relative links so Node resolves transitive dependencies
// from their original .pnpm package directories inside each function.
await cp(source, destination, { recursive: true, verbatimSymlinks: true });
// Show the authored offline fallback on an initial upstream failure while
// retaining Vercel's normal stale-page behavior on regeneration failures.
const isrPath = new URL('functions/_isr.prerender-config.json', destination);
const isr = JSON.parse(await readFile(isrPath, 'utf8'));
isr.exposeErrBody = true;
await writeFile(isrPath, JSON.stringify(isr, null, 2));
await writeFile(
  new URL('config.json', destination),
  JSON.stringify(config, null, 2),
);
console.log(
  'Prepared root .vercel/output with Astro static assets, SSR, and ISR.',
);

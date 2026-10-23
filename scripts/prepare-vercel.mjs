import { readFile, readdir, writeFile } from 'node:fs/promises';

// Services consume each app's output separately. Keep Astro's functions and
// pnpm symlinks in place so they cannot overwrite the forum service's output.
const output = new URL('../apps/astro/.vercel/output/', import.meta.url);
const config = JSON.parse(
  await readFile(new URL('config.json', output), 'utf8'),
);
const rootConfig = JSON.parse(
  await readFile(new URL('../vercel.json', import.meta.url), 'utf8'),
);
const imageHeaders = { 'Content-Type': 'image/png' };
config.overrides ??= {};
config.overrides['opengraph-image'] = { contentType: 'image/png' };
for (const id of await readdir(new URL('static/blog/', output), {
  withFileTypes: true,
})) {
  if (id.isDirectory())
    config.overrides[`blog/${id.name}/opengraph-image`] = {
      contentType: 'image/png',
    };
}
const routes = [
  { src: '^/.*$', headers: { 'X-DNS-Prefetch-Control': 'on' }, continue: true },
  {
    src: '^/(?:blog/[^/]+/)?opengraph-image$',
    headers: imageHeaders,
    continue: true,
  },
  ...rootConfig.services.website.redirects.map(
    ({ source: path, destination: location, permanent }) => ({
      src: `^${path}$`,
      headers: { Location: location },
      status: permanent ? 308 : 307,
    }),
  ),
];
// CI and local verification can prepare an existing build more than once.
const authoredRoutes = new Set(routes.map((route) => JSON.stringify(route)));
config.routes = [
  ...routes,
  ...config.routes.filter(
    (route) => !authoredRoutes.has(JSON.stringify(route)),
  ),
];
// Show the authored offline fallback on an initial upstream failure while
// retaining Vercel's normal stale-page behavior on regeneration failures.
const isrPath = new URL('functions/_isr.prerender-config.json', output);
const isr = JSON.parse(await readFile(isrPath, 'utf8'));
isr.exposeErrBody = true;
await writeFile(isrPath, JSON.stringify(isr, null, 2));
await writeFile(
  new URL('config.json', output),
  JSON.stringify(config, null, 2),
);
console.log('Prepared Astro service output with static assets, SSR, and ISR.');

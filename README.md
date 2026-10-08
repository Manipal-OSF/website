# Manipal OSF website

The official Manipal OSF website is a single Next.js application at the repository root. It uses TypeScript, React, Tailwind CSS, and the Pages Router. Blog posts live in the repository as Markdown files.

## Development

Use Node.js 24 LTS (minimum 22) and PNPM 11.2.2. Run commands from the repository root:

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. No environment variables or separate service are required for the existing site.

Development and production builds use Webpack to avoid a reproducible Turbopack client module-loading error with the current dependencies.

```sh
pnpm typecheck
pnpm lint
pnpm format
```

CI runs the production build with `pnpm build`. A deployed Node.js application starts with `pnpm start`. Configure hosting to use the repository root, with `pnpm install --frozen-lockfile` as the install command and `pnpm build` as the build command.

## Blog posts

See [website configuration](./WEBSITE_CONFIG.md) for the Markdown format, images, and publishing instructions. The blog initially displays “No posts yet.” Add your own content to `content/posts/`; existing hosted content is not copied automatically.

## Server features

Add server endpoints in `pages/api/`, using Next.js `NextApiRequest` and `NextApiResponse`. Keep private environment variables server-side and put reusable server logic in `lib/`. The filesystem blog loader is called directly by `getStaticProps` and `getStaticPaths`; it does not make HTTP calls.

Use a deployment that supports the Next.js Node.js runtime when adding API routes or request-time server rendering.

## Contributing

React, Next.js, TypeScript, Tailwind CSS, and basic HTML knowledge are useful. Contributions to content and bug reports are welcome too.

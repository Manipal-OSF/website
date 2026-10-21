# Manipal OSF website

The Manipal OSF website lives in a pnpm and Turborepo monorepo modeled on [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo). The public website uses Astro components and TypeScript browser scripts, with Vercel ISR for live GitHub data.

## Development

Use Node.js 24 LTS (minimum 22.22 for Astro) and pnpm 11.2.2. Run commands from the repository root:

```sh
pnpm install
pnpm dev
```

Open http://localhost:4321. The public website needs no service credentials. An optional `GITHUB_TOKEN` increases the GitHub API rate limit for statistics.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build        # Vercel deployment output
pnpm build:local  # Node production build
pnpm start        # Serve the Node build on port 4321
pnpm format
```

`dev` starts workspaces under `apps/`. `build`, `lint`, `typecheck`, and `test` use Turbo's dependency graph and cache. Development servers and email previews are uncached. Turbo caches `dist/`, `.astro/`, and `.vercel/output/` build artifacts. Environment changes invalidate task caches.

To target the website directly:

```sh
pnpm --filter @apps/astro dev
pnpm build --filter=@apps/astro...
```

## Workspace structure

| Location         | Package           | Responsibility                                                |
| ---------------- | ----------------- | ------------------------------------------------------------- |
| `apps/astro`     | `@apps/astro`     | Astro website, content, public assets, and site-specific code |
| `packages/env`   | `@packages/env`   | T3 Env validation and root environment loading                |
| `packages/db`    | `@packages/db`    | Lazy Neon HTTP / Drizzle database clients                     |
| `packages/auth`  | `@packages/auth`  | Configurable Better Auth factory                              |
| `packages/ui`    | `@packages/ui`    | Astro avatar/badge components and class helpers               |
| `packages/email` | `@packages/email` | React Email templates and local preview server                |
| `tooling/*`      | `@tooling/*`      | ESLint, Prettier, TypeScript, and Tailwind configuration      |

Workspace imports use real package exports and `workspace:*` dependencies. The website's `@/*` alias refers to its `src/` directory. Shared dependencies are versioned centrally in the pnpm catalog.

See [website configuration](./WEBSITE_CONFIG.md) for posts, authors, images, and publishing. Content lives under `apps/astro/content/`. Astro collections validate Markdown posts and authors, and pages live under `apps/astro/src/pages/`. Public URLs continue to use post frontmatter IDs and author filenames.

## Environment variables

Keep environment files at the repository root:

```sh
cp .env.example .env
```

`with-env` loads root environment files before running Turbo or an application command. It uses `dotenv` and `dotenv-expand`, resolving the root from the loader's location rather than the current directory. Existing process variables win, followed by `.env.<mode>.local`, `.env.local`, `.env.<mode>`, and `.env`. Test mode skips `.env.local`. Vercel supplies process variables through project settings and needs no committed environment file.

Import `env` from `@packages/env` in server code. T3 Env and Zod validate supplied values, treat empty strings as unset, and prevent access to server variables in browser code. The filesystem loader is separate at `@packages/env/load`; do not import it into application runtime code.

| Variable             | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`       | Optional Neon PostgreSQL URL (`postgres://` or `postgresql://`) |
| `BETTER_AUTH_SECRET` | Optional auth secret, at least 32 characters                    |
| `BETTER_AUTH_URL`    | Optional auth origin for a future app instance                  |
| `RESEND_API_KEY`     | Required when calling the website's `getResend()`               |
| `RESEND_FROM_EMAIL`  | Optional sender address on a verified Resend domain             |
| `GITHUB_TOKEN`       | Optional higher GitHub API rate limit                           |

All current variables are server-side. Keep `.env*` ignored except the credential-free example. When adding variables, update the shared validation schema, example file, and Turbo environment inputs together. Future apps can compose their own validation from this package as their requirements diverge.

## Database and authentication

`@packages/db` exports `createDb(url, schema?)` and `getDb()`. Constructing a client does not execute a query. `getDb()` lazily creates a shared schema-less client from `env.DATABASE_URL`, with a clear error when it is unset. Use `createDb` when supplying a typed schema or a different database URL. These APIs are server-only. Neon HTTP supports individual queries and non-interactive batches; interactive transactions require a different driver.

`@packages/auth` exports `createAuth({ db, schema, options })`. Supply an explicit Drizzle auth schema and app-specific `secret`, `baseURL`, and `trustedOrigins`; `options` also accepts Better Auth providers, plugins, and session configuration. The factory preserves plugin and additional-field inference, uses the PostgreSQL Drizzle adapter, and disables interactive transactions. It does not establish a global auth singleton or shared cookie domain.

The website does not instantiate auth or mount auth endpoints. Auth tables, login methods, schema generation, migrations, and login pages remain deferred. When implementing them, generate the schema from the final auth configuration, keep tables and migrations in `packages/db`, and mount the framework-specific handler inside the consuming app. Set each app's URL and trusted origins explicitly. Drizzle Kit is owned by the database package; migration commands will be added with the actual schema.

## Shared UI and Tailwind

Import Astro components from `@packages/ui/components/avatar` and `@packages/ui/components/badge`, and `cn` from `@packages/ui/lib/utils`. The unused button and extra avatar components have been removed. There is no React/shadcn component-generation command.

`@tooling/tailwind/styles.css` provides Tailwind v4, animation imports, theme tokens, the `data-theme` dark variant, common base styles, and shared UI source registration. Applications import this CSS and register their own source directory with `@source`. The website retains its Nord light and Catppuccin dark palettes and self-hosted Cascadia Code font.

The website ships Astro HTML with small browser modules for theme switching, map controls, reading progress, and timeline effects. MapLibre is loaded near the viewport, with campus links available when the map cannot load. React remains in the email package for React Email templates.

## Email templates

```sh
pnpm email:dev
```

Open http://localhost:3001 to preview `packages/email/templates/example.tsx`. Previews need no API key and send no email. Apps can import the template from `@packages/email/example`.

The website retains its lazy `getResend()` helper at `@/lib/resend`. There are no sending endpoints or automatic email triggers.

## Vercel and additional apps

The root `vercel.json` deploys `@apps/astro` using a filtered Turbo build and the Vercel adapter's Build Output API artifacts. The deployment command copies `apps/astro/.vercel/output` into the root `.vercel/output` expected by Vercel, including functions, hourly ISR configuration, redirects, and PNG content types. Keep the Vercel project's Root Directory at the repository root, select Node.js 24, and enable Corepack (`ENABLE_EXPERIMENTAL_COREPACK=1`) to use the pinned pnpm version. Remove conflicting dashboard command overrides. No root framework dependency is needed.

Content pages, feeds, metadata, and social preview PNGs are prerendered. Home and team pages render on demand and use a 3,600-second ISR expiration; after expiry, a request triggers regeneration. Failed GitHub loads return an uncached 503 page with offline messaging or the authored timeline so failed regeneration does not replace successful cached content. Actual Vercel cache hits and regeneration must be verified on a deployment; local Node runs do not emulate the platform cache.

For a local production server, run `pnpm build:local`, then `pnpm start`. The local build explicitly selects `@astrojs/node`; the default `pnpm build` selects `@astrojs/vercel`. You can override the local server's interface and port using `HOST` and `PORT`.

Add future applications under `apps/`, name them `@apps/<name>`, declare shared packages using `workspace:*`, and extend shared tooling. Each future app should have its own Vercel project, environment values, and app-specific deployment configuration. The root config remains specific to the current website; it does not deploy every app. For a project rooted in a new app directory, enable access to files outside that root so shared packages are available. Do not reuse the website's root build and output settings for another app.

GitHub Actions installs with the frozen lockfile and runs typecheck, lint, content/GitHub and service-package tests, the Vercel production build, and execution of the packaged server functions with GitHub offline. No live database, migration, email, or deployment is required for these checks.

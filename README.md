# Manipal OSF website

The Manipal OSF website lives in a pnpm and Turborepo monorepo modeled on [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo). Next.js uses Turbopack for development and production builds.

## Development

Use Node.js 24 LTS (minimum 22.18 for native TypeScript test execution) and pnpm 11.2.2. Run commands from the repository root:

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. The public website needs no service credentials. An optional `GITHUB_TOKEN` increases the GitHub API rate limit for statistics.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
pnpm format
```

`dev` starts workspaces under `apps/`. `build`, `lint`, `typecheck`, and `test` use Turbo's dependency graph and cache. Development servers and email previews are uncached. Build artifacts exclude `.next/cache` from Turbo storage. Environment changes invalidate task caches.

To target the website directly:

```sh
pnpm --filter @apps/nextjs dev
pnpm build --filter=@apps/nextjs...
pnpm --filter @apps/nextjs ui:add input
```

## Workspace structure

| Location         | Package           | Responsibility                                                     |
| ---------------- | ----------------- | ------------------------------------------------------------------ |
| `apps/nextjs`    | `@apps/nextjs`    | App Router website, content, public assets, and site-specific code |
| `packages/env`   | `@packages/env`   | T3 Env validation and root environment loading                     |
| `packages/db`    | `@packages/db`    | Lazy Neon HTTP / Drizzle database clients                          |
| `packages/auth`  | `@packages/auth`  | Configurable Better Auth factory                                   |
| `packages/ui`    | `@packages/ui`    | Shared Base UI components and class helpers                        |
| `packages/email` | `@packages/email` | React Email templates and local preview server                     |
| `tooling/*`      | `@tooling/*`      | ESLint, Prettier, TypeScript, and Tailwind configuration           |

Workspace imports use real package exports and `workspace:*` dependencies. The website's `@/*` alias refers to its `src/` directory. Shared dependencies are versioned centrally in the pnpm catalog.

See [website configuration](./WEBSITE_CONFIG.md) for posts, authors, images, and publishing. Content lives under `apps/nextjs/content/`. The MDX registry lives in `apps/nextjs/src/mdx-components.tsx`, beside `src/app/`.

## Environment variables

Keep environment files at the repository root:

```sh
cp .env.example .env
```

`with-env` loads root environment files before running Turbo or an application command. It uses Next.js environment loading, resolving the root from the loader's location rather than the current directory. Existing process variables win, followed by `.env.<mode>.local`, `.env.local`, `.env.<mode>`, and `.env`. Test mode skips `.env.local`. Vercel supplies process variables through project settings and needs no committed environment file.

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

Import components from `@packages/ui/components/button` (or `badge` / `avatar`) and `cn` from `@packages/ui/lib/utils`. Add shadcn components from the website workspace using `pnpm --filter @apps/nextjs ui:add <component>`; its aliases route shared primitives to the UI package.

`@tooling/tailwind/styles.css` provides Tailwind v4, shared animation imports, theme tokens, the `data-theme` dark variant, common base styles, and shared UI source registration. Applications import this CSS and register their own source directory with `@source`. App-specific layout and typography remain local. `@tooling/tailwind/postcss` exports the PostCSS configuration. Keep the existing Nord light and Catppuccin dark palettes.

## Email templates

```sh
pnpm email:dev
```

Open http://localhost:3001 to preview `packages/email/templates/example.tsx`. Previews need no API key and send no email. Apps can import the template from `@packages/email/example`.

The website retains its lazy `getResend()` helper at `@/lib/resend`. There are no sending endpoints or automatic email triggers.

## Vercel and additional apps

The root `vercel.json` deploys `@apps/nextjs` using pnpm, a filtered Turbo build, and `apps/nextjs/.next` as the output directory. Keep the existing Vercel project's Root Directory at the repository root (empty/default), select Node.js 24, and enable [Corepack](https://vercel.com/docs/builds/configure-a-build#corepack) (`ENABLE_EXPERIMENTAL_COREPACK=1`) so Vercel uses the package-manager version pinned in `package.json`. Remove conflicting dashboard command overrides. A matching root Next.js dependency supports framework detection with pnpm's isolated installation.

Add future applications under `apps/`, name them `@apps/<name>`, declare shared packages using `workspace:*`, and extend shared tooling. Each future app should have its own Vercel project, environment values, and app-specific deployment configuration. The root config remains specific to the current website; it does not deploy every app. For a project rooted in a new app directory, enable access to files outside that root so shared packages are available. Do not reuse the website's root build and output settings for another app.

GitHub Actions installs with the frozen lockfile and runs typecheck, lint, service-package tests, and the production build. No live database, migration, email, or deployment is required for these checks.

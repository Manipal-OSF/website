# Manipal OSF website

The Manipal OSF website lives in a pnpm and Turborepo monorepo modeled on [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo). The public website uses Astro components and TypeScript browser scripts, with Vercel ISR for live GitHub data. A Next.js app hosts the community forum at https://forum.manipalosf.org/. Both apps deploy together through Vercel Services.

## Development

Use Node.js 24 LTS (minimum 22.22 for Astro) and pnpm 11.2.2. Run commands from the repository root:

```sh
pnpm install
pnpm dev
```

Open http://localhost:4321 for the public site or http://localhost:3000/ for the forum. The public website needs no service credentials. An optional `GITHUB_TOKEN` increases the GitHub API rate limit for statistics.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build        # Vercel deployment output
pnpm build:local  # Node production build
pnpm start        # Serve the Astro Node build on port 4321
pnpm start:forum  # Serve the Next.js production build on port 3000
pnpm dev:forum    # Run just the forum
pnpm format
```

`dev` starts workspaces under `apps/`. `build`, `lint`, `typecheck`, and `test` use Turbo's dependency graph and cache. Development servers and email previews are uncached. Turbo caches `dist/`, `.astro/`, and `.vercel/output/`, and `.next/` build artifacts (excluding the Next.js compiler cache). Environment changes invalidate task caches.

To target the website directly:

```sh
pnpm --filter @apps/astro dev
pnpm build --filter=@apps/astro...
```

## Workspace structure

| Location         | Package           | Responsibility                                                |
| ---------------- | ----------------- | ------------------------------------------------------------- |
| `apps/astro`     | `@apps/astro`     | Astro website, content, public assets, and site-specific code |
| `apps/nextjs`    | `@apps/nextjs`    | Next.js community forum and authentication                    |
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

| Variable             | Purpose                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Optional Neon PostgreSQL URL (`postgres://` or `postgresql://`)                                                      |
| `BETTER_AUTH_SECRET` | Optional auth secret, at least 32 characters                                                                         |
| `BETTER_AUTH_URL`    | Forum auth origin: `http://localhost:3000` locally, `https://forum.manipalosf.org` in production                     |
| `DEV_DATABASE_URL`   | Direct development connection for migrations/moderator commands                                                      |
| `PROD_DATABASE_URL`  | Direct production connection for migrations/moderator commands                                                       |
| `PUBLIC_FORUM_URL`   | Forum navigation URL; defaults to `http://localhost:3000/` locally and `https://forum.manipalosf.org/` in production |
| `PUBLIC_SITE_URL`    | Forum link back to Astro; defaults to local Astro in development and `https://manipalosf.org` in production          |
| `RESEND_API_KEY`     | Required for forum signup, verification emails, and password recovery                                                |
| `RESEND_FROM_EMAIL`  | Required sender address on a verified Resend domain for forum authentication emails                                  |
| `GITHUB_TOKEN`       | Optional higher GitHub API rate limit                                                                                |

Only the two `PUBLIC_` link settings are public; credentials remain server-side. Migration URLs are read only by database tooling and never by application runtime code. Keep `.env*` ignored except the credential-free example. When adding variables, update the shared validation schema, example file, and Turbo environment inputs together. Future apps can compose their own validation from this package as their requirements diverge.

## Database and authentication

`@packages/db` exports `createDb(url, schema?)` and `getDb()`. Constructing a client does not execute a query. `getDb()` lazily creates a shared schema-less client from `env.DATABASE_URL`, with a clear error when it is unset. Use `createDb` when supplying a typed schema or a different database URL. These APIs are server-only. Neon HTTP supports individual queries and non-interactive batches; interactive transactions require a different driver.

`@packages/auth` exports `createAuth({ db, schema, options })`. Supply an explicit Drizzle auth schema and app-specific `secret`, `baseURL`, and `trustedOrigins`; `options` also accepts Better Auth providers, plugins, and session configuration. The factory preserves plugin and additional-field inference, uses the PostgreSQL Drizzle adapter, and disables interactive transactions. It does not establish a global auth singleton or shared cookie domain.

Astro does not mount authentication. The Next.js app instantiates the shared factory with the username plugin, app-specific origins, and schemas exported by `@packages/db/schema/auth`. The full schema is available at `@packages/db/schema`; the generic `createDb` and `getDb` APIs remain available.

### Forum setup

Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` at the repository root, with runtime and migration connections pointing to the same database. Use an address on a verified Resend domain for `RESEND_FROM_EMAIL`. Set `DEV_DATABASE_URL` to the direct development connection, then run:

```sh
pnpm db:migrate:dev
pnpm dev
```

Use **Log in** in the forum header, then **Create an account** to sign up. Signup requires a name, email, unique username (3–30 letters, digits, underscores, or dots), and an 8–128 character password. Signup sends a verification email and does not create a session. Members must verify their email before logging in with email or username; existing unverified members must verify before their next login. Verification links expire after one hour. `/verify-email` provides resend instructions and confirmation; after verification, members log in explicitly. Unverified login attempts also send a fresh verification email. Successful authentication returns to a validated local forum destination. Signed-in members see their username and Logout. Anonymous visitors can read, but participation requires a session.

**Forgot password?** on login opens `/forgot-password`. Requests display the same confirmation for known and unknown addresses. The email opens `/reset-password`, where members enter and confirm an 8–128 character password. Reset links expire after one hour and can be used once. A successful reset revokes all existing sessions and requires a new login; it does not mark an unverified email as verified. Existing sessions otherwise remain valid until logout or expiry. Email callbacks use React Email templates and Resend; missing email configuration returns a sanitized 503 for email-dependent operations while forum reads and existing sessions remain available. Delivery failures offer retry instructions, and an account created before a failed verification email can request a new link.

The auth handler lives at `/api/auth/[...all]`, including Better Auth's verification and password reset endpoints and rate limiting. Cookies are scoped to the forum host; the two apps do not share sessions. OAuth and profile editing are not included. Without database credentials, forum pages display an unavailable message and auth endpoints return a sanitized 503. Both apps still build without credentials. The existing auth tables support verification and recovery; no additional migration is needed.

### Forum behavior

The forum ports `feat/forum-legacy`: Top/New/Ask/Show feeds, search, pagination, link/text submissions, threaded replies, reversible upvotes, author editing/deletion, member activity/karma, reports, and moderation. User content is plain text with HTTP(S) links. Deleted comments retain their replies; hidden discussions conceal their replies; locked discussions reject new replies. Forum and auth pages use `noindex` metadata.

Internal forum keys remain PostgreSQL BIGINT identities mapped to JavaScript `bigint`; public post/comment IDs remain 16-character NanoIDs. Preserve the comment-integrity trigger, indexes, database constraints, atomic writes, and the per-account rate limits in the ported schema/store. Signup cannot grant moderator access. Moderator actions require reasons and create audit records.

```sh
pnpm forum:moderator add your_username         # DEV_DATABASE_URL
pnpm forum:moderator remove your_username
pnpm forum:moderator add your_username prod    # PROD_DATABASE_URL
```

### Schema and migrations

Schemas and committed migration history live in `packages/db`. The legacy SQL, journal, and snapshots are preserved, so an existing migrated database does not need to be recreated. Subsequent changes must use additive migrations; never rewrite applied history. Keep generated auth tables separate from forum tables.

```sh
pnpm auth:generate     # Pinned auth@1.7.7 CLI, matching Better Auth
pnpm db:generate       # Generate SQL from the shared schema
pnpm db:check          # Check migration-history consistency
pnpm db:migrate        # Alias for db:migrate:dev
pnpm db:migrate:dev    # Requires DEV_DATABASE_URL
pnpm db:migrate:prod   # Requires PROD_DATABASE_URL
pnpm test:forum        # Forum, auth, and deployment tests
pnpm test:auth
pnpm test:db
```

Generation and history checks do not connect to a database. Migration and moderator commands load root environment files for the explicitly selected stage, honor injected values, and never fall back to another stage's URL or `DATABASE_URL`. Tests apply migrations twice to disposable PGlite databases, exercising actual PostgreSQL queries without Neon credentials.

## Shared UI and Tailwind

Import Astro components from `@packages/ui/components/avatar` and `@packages/ui/components/badge`, and `cn` from `@packages/ui/lib/utils`. The unused button and extra avatar components have been removed. Next.js keeps its React forum controls inside its own app and reuses the shared `cn` helper; the Astro component exports remain framework-specific.

`@tooling/tailwind/styles.css` provides Tailwind v4, animation imports, theme tokens, the `data-theme` dark variant, common base styles, and shared UI source registration. Applications import this CSS and register their own source directory with `@source`. The website retains its Nord light and Catppuccin dark palettes and self-hosted Cascadia Code font.

The website ships Astro HTML with small browser modules for theme switching, map controls, reading progress, and timeline effects. MapLibre is loaded near the viewport, with campus links available when the map cannot load. React is used by the Next.js forum and React Email templates.

## Email templates

```sh
pnpm email:dev
```

Open http://localhost:3001 to preview the email verification and password reset templates. Previews use sample links, need no API key, and send no email. Apps can import templates from `@packages/email/verify-email` and `@packages/email/reset-password`. `@packages/email/render` renders auth emails to HTML and plain text.

All templates use Nord light colors and switch to Catppuccin Mocha in clients that support dark-mode email styles. Inline Nord colors provide a fallback for clients that strip embedded CSS.

The forum lazily creates its own server-only Resend client for authentication emails using `RESEND_API_KEY` and `RESEND_FROM_EMAIL`. Automatic sends are limited to auth flows; there is no general-purpose public email endpoint. The Astro website retains its separate lazy `getResend()` helper at `@/lib/resend`. Auth integration tests capture emails locally and exercise PostgreSQL migrations with PGlite; they never send live mail.

## Vercel deployment

The repository-root `vercel.json` deploys both applications as one Vercel project using [Vercel Services](https://vercel.com/docs/services), currently in beta. The `website` service builds Astro from `apps/astro`; the `forum` service builds Next.js from `apps/nextjs`. Each service owns its framework and build settings in this single configuration file. Both apps deploy and roll back together.

Top-level hostname routing sends every request on `forum.manipalosf.org` to the forum, including `/api/auth`, Server Actions, and `/_next` assets. Remaining hosts, including the default Vercel deployment URL, serve Astro. Website redirects and image headers are scoped to the website service. The forum feed lives at `/`, with discussions at `/item/:publicId`, profiles at `/user/:username`, and `/comments`, `/submit`, and `/moderation` alongside them. Legacy `/forum` and `/forum/*` URLs permanently redirect to their new paths and retain query strings.

### Project and domains

Use one Vercel project with its Root Directory at the repository root, select Node.js 24, and enable Corepack (`ENABLE_EXPERIMENTAL_COREPACK=1`) to use the pinned pnpm version. Allow workspace files outside service directories and remove old dashboard framework/build/output overrides; `services` in the root configuration owns the per-app settings. An existing project rooted at `apps/nextjs` is no longer required.

Attach `manipalosf.org` and `forum.manipalosf.org` to this project under Settings → Domains, then configure the DNS records Vercel supplies. Reassign the forum hostname from any previous forum project. Domain ownership and DNS setup are managed in Vercel and your DNS provider, rather than in `vercel.json`.

Set these environment values in the project's **Production** environment:

| Variable                       | Value                                                          |
| ------------------------------ | -------------------------------------------------------------- |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1`                                                            |
| `BETTER_AUTH_URL`              | `https://forum.manipalosf.org`                                 |
| `PUBLIC_SITE_URL`              | `https://manipalosf.org`                                       |
| `PUBLIC_FORUM_URL`             | Optional override; defaults to `https://forum.manipalosf.org/` |
| `DATABASE_URL`                 | Forum runtime connection to the production database            |
| `PROD_DATABASE_URL`            | Direct migration connection to the same production database    |
| `BETTER_AUTH_SECRET`           | Auth secret, at least 32 characters                            |
| `RESEND_API_KEY`               | Resend API key                                                 |
| `RESEND_FROM_EMAIL`            | Sender address on a verified Resend domain                     |

Preview deployment URLs default to Astro; continue using port 3000 for local forum development. A forum preview requires an explicitly assigned preview hostname, an additional forum host condition in the root configuration, and a matching preview `BETTER_AUTH_URL`. Preview database settings must use a development database: set `DEV_DATABASE_URL` and point preview `DATABASE_URL` to that same database. Keep secrets in Vercel environment settings and never commit them. Cross-app navigation uses ordinary links, and cookies remain scoped to the forum host.

### Builds, migrations, and validation

Astro's service build runs `pnpm run build` inside `apps/astro`, then `scripts/prepare-vercel.mjs` finalizes its own `apps/astro/.vercel/output`. It preserves packaged dependencies, hourly ISR, redirects, PNG content types, and authored offline responses. No output is copied to the repository root or merged with Next.js artifacts.

Content pages, feeds, metadata, and social preview PNGs are prerendered. Home and team pages render on demand and use a 3,600-second ISR expiration; after expiry, a request triggers regeneration. Failed GitHub loads return an uncached 503 page with offline messaging or the authored timeline so failed regeneration does not replace successful cached content. Actual Vercel cache hits and regeneration must be verified on a deployment; local Node runs do not emulate the platform cache.

The forum service runs its `build:vercel` script: history check, database migrations, then the Next.js build. `VERCEL_ENV=production` selects `PROD_DATABASE_URL`; `preview` and `development` select `DEV_DATABASE_URL`. Missing/unknown environments, missing migration URLs, and failed steps stop deployment. Ordinary `pnpm build` and CI builds never migrate live databases. Migrations remain applied if either service's build later fails, so keep changes compatible with the prior deployment.

GitHub Actions installs with the frozen lockfile and runs typecheck, lint, tests, migration-history checks, both production builds, and Astro service-output verification. No live database, migration, email, or deployment is required for CI. On Vercel, verify hostname isolation, forum routes and legacy redirects, authentication and email origins, assets, and Astro ISR before considering the rollout complete.

For a local production server, run `pnpm build:local`, then `pnpm start`. The local build explicitly selects `@astrojs/node`; the default `pnpm build` selects `@astrojs/vercel`. You can override the local server's interface and port using `HOST` and `PORT`.

Add future applications under `apps/`, name them `@apps/<name>`, declare shared packages using `workspace:*`, and add their service and routing rules to the root `vercel.json` when they should share this deployment.

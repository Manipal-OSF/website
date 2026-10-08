# Manipal OSF website

The official Manipal OSF website is a single Next.js application at the repository root. It uses TypeScript, React, Tailwind CSS, and the App Router. Blog posts live in the repository as Markdown files.

## Development

Use Node.js 24 LTS (minimum 22) and PNPM 11.2.2. Run commands from the repository root:

```sh
pnpm install
pnpm dev
```

Open http://localhost:3000. No environment variables or separate service are required for the existing site.

Development and production builds use Turbopack.

```sh
pnpm typecheck
pnpm lint
pnpm format
```

CI runs the production build with `pnpm build`. A deployed Node.js application starts with `pnpm start`. Configure hosting to use the repository root, with `pnpm install --frozen-lockfile` as the install command and `pnpm build` as the build command.

## Blog posts

See [website configuration](./WEBSITE_CONFIG.md) for the Markdown format, images, and publishing instructions. The blog initially displays “No posts yet.” Add your own content to `content/posts/`; existing hosted content is not copied automatically.

The `@next/mdx` component registry lives in `mdx-components.tsx` at the repository root, beside `app/`, as required by Next.js. Keep it there when adding MDX components. The filesystem blog continues to render Markdown using `MarkdownRenderer`.

## UI components

shadcn/ui is configured with the Base UI Nova style, TypeScript, React Server Components, Lucide icons, and the `@/*` import alias pointing to the repository root. Its CSS variables extend the existing Nord light and Catppuccin dark themes, using the existing `data-theme` switch.

Import the initial Button from `@/components/ui/button` and shared class helpers from `@/lib/utils`. Add more components from the repository root:

```sh
pnpm exec shadcn add input
```

`components.json` points to `styles/globals.css`; Tailwind v4 does not need a separate Tailwind configuration file. Keep the existing palettes and `data-theme` convention when adding theme tokens.

## Environment variables

The public site runs without service credentials. When preparing backend features, copy the example file:

```sh
cp .env.example .env.local
```

`lib/env.ts` uses T3 Env and Zod to validate settings during development and builds. Service settings are optional, and blank values are treated as unset. Values supplied must be valid. Import `env` from `@/lib/env` in server code instead of reading `process.env` directly. All settings below are server variables; do not expose credentials using `NEXT_PUBLIC_`.

| Variable             | Purpose                                                                                |
| -------------------- | -------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Neon PostgreSQL connection string (`postgres://` or `postgresql://`).                  |
| `BETTER_AUTH_SECRET` | Future auth secret of at least 32 characters; generate with `openssl rand -base64 32`. |
| `BETTER_AUTH_URL`    | Future auth server origin, such as `http://localhost:3000`.                            |
| `RESEND_API_KEY`     | API key required when calling `getResend()`.                                           |
| `RESEND_FROM_EMAIL`  | Plain sender email address on a Resend-verified domain, for future sending features.   |

Real `.env*` files are ignored by Git; `.env.example` contains no credentials and is tracked.

## Database and authentication

Drizzle ORM, Drizzle Kit, the Neon serverless driver, Better Auth, and its Drizzle adapter are installed for later use. Database clients, application/auth schemas, migrations, auth routes, and login pages are deferred. The blog still uses repository Markdown files.

When implementing these features, configure a Neon PostgreSQL database with the validated `DATABASE_URL`, use `drizzle-orm/neon-http` for HTTP queries (or `drizzle-orm/neon-serverless` when interactive transactions are needed), and connect Better Auth through `@better-auth/drizzle-adapter` with PostgreSQL provider `pg`. Generate the auth schema from the final auth configuration before creating Drizzle migrations. Add the auth Route Handler under `app/api/auth/[...all]/route.ts` and keep client auth code separate from server credentials.

Drizzle Kit runs outside the Next.js runtime. Before adding its configuration, use `@next/env` to load the root `.env*` files so CLI commands follow the same environment loading rules as Next.js.

## Email templates

Resend and React Email are ready for future email features. Components and rendering utilities use the current `react-email` package; `@react-email/ui` provides local previews.

```sh
pnpm email:dev
```

Open http://localhost:3001 to preview `emails/example.tsx`. Previews need no API key and send no email.

Server code can import `getResend` from `@/lib/resend` to obtain a lazily initialized Resend client. It throws a clear error if `RESEND_API_KEY` is unset when called. When adding a sending feature, pass a verified sender, recipient, subject, and React Email template to `getResend().emails.send(...)`, and handle the returned `error`. There are no sending endpoints or automatic email triggers yet.

## Server features

Add server endpoints as Route Handlers in `app/**/route.ts`, using the Web `Request` and `Response` APIs or Next.js `NextRequest` and `NextResponse`. Keep private environment variables server-side and put reusable server logic in `lib/`. Async Server Components, post metadata, and `generateStaticParams` call the server-only filesystem blog loader directly; it does not make HTTP calls.

Use a deployment that supports the Next.js Node.js runtime when adding Route Handlers or request-time server rendering.

## Page transitions

Internal site links use `components/TransitionLink` and `next-transition-router` to finish the current page's exit animation before navigating, then reset scroll and animate the new page in. The shared header and footer stay mounted. Browser Back/Forward uses native navigation and scroll restoration without page transitions. Use the transition-aware Link with `scroll={false}` when adding site navigation; external links and Markdown anchors retain normal browser behavior.

## Contributing

React, Next.js, TypeScript, Tailwind CSS, and basic HTML knowledge are useful. Contributions to content and bug reports are welcome too.

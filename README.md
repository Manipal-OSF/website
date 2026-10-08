# Manipal OSF website

The official Manipal OSF website is a single Next.js application at the repository root. It uses TypeScript, React, Tailwind CSS, and the App Router. Blog posts live in the repository as Markdown files.

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

Add server endpoints as Route Handlers in `app/**/route.ts`, using the Web `Request` and `Response` APIs or Next.js `NextRequest` and `NextResponse`. Keep private environment variables server-side and put reusable server logic in `lib/`. Async Server Components, post metadata, and `generateStaticParams` call the server-only filesystem blog loader directly; it does not make HTTP calls.

Use a deployment that supports the Next.js Node.js runtime when adding Route Handlers or request-time server rendering.

## Page transitions

Internal site links use `components/TransitionLink` and `next-transition-router` to finish the current page's exit animation before navigating, then reset scroll and animate the new page in. The shared header and footer stay mounted. Browser Back/Forward uses native navigation and scroll restoration without page transitions. Use the transition-aware Link with `scroll={false}` when adding site navigation; external links and Markdown anchors retain normal browser behavior.

## Contributing

React, Next.js, TypeScript, Tailwind CSS, and basic HTML knowledge are useful. Contributions to content and bug reports are welcome too.

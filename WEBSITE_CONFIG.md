# Website configuration

The website is in `apps/nextjs/`. Source files are under `src/`, while `content/`, `public/`, and Next.js configuration are at the app root. Run `pnpm dev` from the repository root. No environment variables are needed for the public site. Shared environment files belong at the repository root; never prefix secrets with `NEXT_PUBLIC_`. Paths below are relative to `apps/nextjs/`.

## Home page

The home page is a bento grid (`src/app/page.tsx`, laid out by the `.bento` rules in `src/styles/globals.css`). Its statistics, language breakdown, and commit calendar come from the public GitHub API for the [Manipal-OSF](https://github.com/Manipal-OSF) organization (`src/lib/github.ts`). Responses are cached for a day and the page re-renders hourly; if GitHub is unreachable, those cells say so instead of failing the page. Unauthenticated requests are limited to 60 an hour, so set `GITHUB_TOKEN` in the repository-root `.env` or the hosting environment if builds or previews run often. A fine-grained token without any permissions is enough.

The map uses [MapLibre](https://maplibre.org/) with [OpenFreeMap](https://openfreemap.org/) tiles; edit `regions` in `src/components/home/KarnatakaMap.tsx` to change the places in its menu.

## SEO

It's added now

## Write a blog post

Create `content/posts/your-post.md`:

```md
---
id: your-post
title: Your post title
description: One-sentence summary shown on the blog list and in link previews.
authors:
  - your-author-id
publishDate: '2026-10-08'
status: draft
tags:
  - open-source
coverImage: /images/your-post.jpg
---

## Introduction

Write standard Markdown here, including **bold text**, links, fenced code blocks, and GitHub-flavored Markdown tables and task lists.
```

- `id` determines the URL (`/blog/your-post`), independently of the filename. IDs must be unique across drafts and published posts and contain only letters, numbers, underscores, or hyphens. Numeric IDs are supported for preserving existing URLs.
- `title` is a non-empty string; `authors` is a non-empty array. Each entry is either an author ID from `content/authors/` (shown with an avatar and a link to their profile) or a plain name for contributors without a profile.
- `description` and `tags` are optional. Tags are displayed as badges.
- Reading time is calculated from the body at roughly 200 words per minute; it is not set in frontmatter.
- `publishDate` is a quoted, valid `YYYY-MM-DD` date. Published posts sort newest first. This date is display metadata, not a publishing schedule.
- `status` must be `draft` or `published`. Only published posts appear in the list or have public detail pages. There is no draft preview.
- `coverImage` is optional. Place the example image in `public/images/your-post.jpg`; omit this field to display the existing placeholder. Images must use local public paths beginning with a single `/`.
- The body supports Markdown rather than JSX or raw HTML. Start headings at `##`, since the page already renders the title as an `h1`.

Invalid metadata and duplicate IDs produce errors identifying the offending post or ID.

## Add an author profile

Create `content/authors/your-author-id.md`. The filename (without `.md`) is the author ID used in post `authors` lists and in the profile URL (`/authors/your-author-id`):

```md
---
name: Your Name
pronouns: they/them
avatar: /authors/your-author-id.png
bio: A short line about yourself.
website: https://example.com
github: https://github.com/your-username
linkedin: https://www.linkedin.com/in/your-username
twitter: https://x.com/your-username
mail: you@example.com
---
```

Only `name` is required. `avatar` must be a local public path (place the image in `public/authors/`); without one, the author's initial is shown. Links must use `https://`. Each post page ends with the profiles of its registered authors, and `/authors` lists everyone.

## Publish

Change `status` to `published`, commit the Markdown and any images, and deploy. App Router Server Components and `generateStaticParams` generate blog pages during the production build; additions, edits, and removals require a rebuild and deployment. During development, the content loader reads files on each page request. Reload the page to see content changes; new published IDs work without restarting the dev server.

Unknown or draft post URLs return 404. Historical hosted posts must be exported and converted to this format separately, preserving their IDs if their existing URLs need to keep working.

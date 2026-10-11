# Website configuration

All source, public assets, and configuration are at the repository root. Run `pnpm dev` from this directory. No environment variables are needed for the existing site. Future server features can read private values from `.env.local`; never prefix secrets with `NEXT_PUBLIC_`.

## Write a blog post

Create `content/posts/your-post.md`:

```md
---
id: your-post
title: Your post title
authors:
  - Your Name
publishDate: '2026-10-08'
status: draft
coverImage: /images/your-post.jpg
---

## Introduction

Write standard Markdown here, including **bold text**, links, fenced code blocks, and GitHub-flavored Markdown tables and task lists.
```

- `id` determines the URL (`/blog/your-post`), independently of the filename. IDs must be unique across drafts and published posts and contain only letters, numbers, underscores, or hyphens. Numeric IDs are supported for preserving existing URLs.
- `title` is a non-empty string; `authors` is a non-empty array of names.
- `publishDate` is a quoted, valid `YYYY-MM-DD` date. Published posts sort newest first. This date is display metadata, not a publishing schedule.
- `status` must be `draft` or `published`. Only published posts appear in the list or have public detail pages. There is no draft preview.
- `coverImage` is optional. Place the example image in `public/images/your-post.jpg`; omit this field to display the existing placeholder. Images must use local public paths beginning with a single `/`.
- The body supports Markdown rather than JSX or raw HTML. Start headings at `##`, since the page already renders the title as an `h1`.

The directory initially contains only `.gitkeep`, so the blog shows “No posts yet.” Invalid metadata and duplicate IDs produce errors identifying the offending post or ID.

## Publish

Change `status` to `published`, commit the Markdown and any images, and deploy. App Router Server Components and `generateStaticParams` generate blog pages during the production build; additions, edits, and removals require a rebuild and deployment. During development, the content loader reads files on each page request. Reload the page to see content changes; new published IDs work without restarting the dev server.

Unknown or draft post URLs return 404. Historical hosted posts must be exported and converted to this format separately, preserving their IDs if their existing URLs need to keep working.

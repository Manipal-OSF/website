import 'server-only';
import { cache } from 'react';
import { z } from 'zod';
import type { Author, AuthorLink, PostAuthor } from '@/types/blog';
import { parseFrontmatter, readMarkdownFiles } from './collection';
import { httpsUrl, localPublicPath, nonEmptyString, slug } from './schema';

const authorSchema = z.object({
  name: nonEmptyString,
  pronouns: nonEmptyString.optional(),
  avatar: localPublicPath.optional(),
  bio: nonEmptyString.optional(),
  website: httpsUrl.optional(),
  github: httpsUrl.optional(),
  linkedin: httpsUrl.optional(),
  twitter: httpsUrl.optional(),
  mail: z.email('must be an email address').optional(),
});

type AuthorFrontmatter = z.output<typeof authorSchema>;

// Display order and labels of profile links.
const linkLabels = {
  website: 'Website',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  twitter: 'X',
} as const;

function toLinks(data: AuthorFrontmatter): AuthorLink[] {
  const links: AuthorLink[] = Object.entries(linkLabels).flatMap(
    ([field, label]) => {
      const href = data[field as keyof typeof linkLabels];
      return href ? [{ label, href }] : [];
    }
  );
  if (data.mail) links.push({ label: 'Email', href: `mailto:${data.mail}` });
  return links;
}

// Authors sorted by name for the time being
export const getAllAuthors = cache(async (): Promise<Author[]> => {
  const files = await readMarkdownFiles('authors');
  return files
    .map((file) => {
      const id = slug.safeParse(file.name);
      if (!id.success) {
        throw new Error(
          `Invalid author ${file.filename}: filename ${id.error.issues[0].message}`
        );
      }
      const data = parseFrontmatter(authorSchema, file, 'author');
      return {
        id: id.data,
        name: data.name,
        pronouns: data.pronouns ?? null,
        avatar: data.avatar ?? null,
        bio: data.bio ?? null,
        links: toLinks(data),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

export async function getAuthor(id: string): Promise<Author | null> {
  return (await getAllAuthors()).find((author) => author.id === id) ?? null;
}

// Post author entries are author IDs, or plain names for people without a profile.
export async function resolveAuthors(entries: string[]): Promise<PostAuthor[]> {
  const authors = new Map((await getAllAuthors()).map((a) => [a.id, a]));
  return entries.map((entry) => {
    const author = authors.get(entry);
    return author
      ? { ...author, isRegistered: true }
      : { id: null, name: entry, avatar: null, isRegistered: false };
  });
}

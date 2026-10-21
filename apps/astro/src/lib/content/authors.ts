import { getCollection, type CollectionEntry } from 'astro:content';
import type { Author, AuthorLink, PostAuthor } from '@/types/blog';
type AuthorFrontmatter = CollectionEntry<'authors'>['data'];

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
    },
  );
  if (data.mail) links.push({ label: 'Email', href: `mailto:${data.mail}` });
  return links;
}

export async function getAllAuthors(): Promise<Author[]> {
  return (await getCollection('authors'))
    .map(({ id, data }) => ({
      id,
      name: data.name,
      pronouns: data.pronouns ?? null,
      avatar: data.avatar ?? null,
      bio: data.bio ?? null,
      links: toLinks(data),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
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

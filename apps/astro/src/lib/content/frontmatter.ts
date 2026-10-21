import { z } from 'zod';
import {
  isoDate,
  localPublicPath,
  nonEmptyString,
  slug,
  httpsUrl,
} from './schema';
export const postSchema = z.object({
  // Numeric IDs preserve URLs from posts previously published with numeric IDs.
  id: z.preprocess(
    (value) => (typeof value === 'number' ? String(value) : value),
    slug,
  ),
  title: nonEmptyString,
  description: nonEmptyString.optional(),
  authors: z
    .array(nonEmptyString)
    .min(1, 'must list at least one author')
    .refine(
      (authors) => new Set(authors).size === authors.length,
      'must not list an author twice',
    ),
  publishDate: isoDate,
  status: z.enum(['draft', 'published']),
  tags: z.array(nonEmptyString).default([]),
  coverImage: localPublicPath.optional(),
});

export const authorSchema = z.object({
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

export function assertUniquePostIds(posts: { id: string }[]) {
  const ids = new Set<string>();
  for (const { id } of posts) {
    if (ids.has(id)) throw new Error(`Duplicate blog post id: ${id}`);
    ids.add(id);
  }
}

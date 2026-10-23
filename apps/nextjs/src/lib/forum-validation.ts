import { customAlphabet } from 'nanoid';
import { z } from 'zod';

export const createPublicId = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  16,
);
export const publicIdSchema = z
  .string()
  .regex(/^[a-z0-9]{16}$/, 'Invalid discussion ID.');
export const postInput = z
  .object({
    title: z.string().trim().min(1, 'Enter a title.').max(300),
    kind: z.enum(['link', 'text']),
    category: z.enum(['general', 'ask', 'show']),
    url: z.string().trim().max(2048).default(''),
    body: z.string().trim().max(20000).default(''),
  })
  .superRefine((value, ctx) => {
    if (value.kind === 'link') {
      try {
        const url = new URL(value.url);
        if (
          !['http:', 'https:'].includes(url.protocol) ||
          url.username ||
          url.password
        )
          throw new Error();
      } catch {
        ctx.addIssue({
          code: 'custom',
          path: ['url'],
          message: 'Enter a valid HTTP or HTTPS URL without credentials.',
        });
      }
      if (value.category === 'ask')
        ctx.addIssue({
          code: 'custom',
          path: ['kind'],
          message: 'Ask posts must be text discussions.',
        });
      if (value.body)
        ctx.addIssue({
          code: 'custom',
          path: ['body'],
          message: 'For a link post, add your thoughts as a comment.',
        });
    } else {
      if (!value.body)
        ctx.addIssue({
          code: 'custom',
          path: ['body'],
          message: 'Enter the discussion text.',
        });
      if (value.url)
        ctx.addIssue({
          code: 'custom',
          path: ['url'],
          message: 'Text discussions cannot have a submission URL.',
        });
    }
  });
export const commentInput = z.object({
  postId: publicIdSchema,
  parentId: publicIdSchema.optional(),
  body: z.string().trim().min(1, 'Enter a comment.').max(10000),
});
export const targetInput = z.object({
  target: z.enum(['post', 'comment']),
  id: publicIdSchema,
});
export const reportInput = targetInput.extend({
  reason: z.string().trim().min(1, 'Enter a reason.').max(1000),
});
export const moderationInput = targetInput
  .extend({
    operation: z.enum(['hide', 'restore', 'lock', 'unlock', 'dismiss']),
    reason: z.string().trim().min(1, 'Enter a moderation reason.').max(1000),
    reportId: z
      .string()
      .regex(/^[1-9][0-9]{0,18}$/)
      .optional(),
  })
  .refine(
    (v) => !['lock', 'unlock'].includes(v.operation) || v.target === 'post',
    'Only discussions can be locked.',
  )
  .refine(
    (v) => v.operation !== 'dismiss' || !!v.reportId,
    'Select a report to dismiss.',
  );

export function safeForumReturn(value: unknown): string {
  // Reject control characters before parsing a user-supplied redirect URL.
  // eslint-disable-next-line no-control-regex
  if (typeof value !== 'string' || /[\\\s\x00-\x1f]/.test(value)) return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, 'https://forum.invalid');
    const path = url.pathname.replace(/^\/forum(?=\/|$)/, '') || '/';
    if (
      url.origin !== 'https://forum.invalid' ||
      !(
        path === '/' ||
        /^\/(comments|submit|moderation)\/?$/.test(path) ||
        /^\/item\/[a-z0-9]{16}\/?$/.test(path) ||
        /^\/user\/[a-zA-Z0-9_.]{3,30}\/?$/.test(path)
      )
    )
      return '/';
    return `${path}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

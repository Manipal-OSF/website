import { z } from 'zod';

export const nonEmptyString = z.string().trim().min(1, 'must not be empty');

export const slug = z
  .string()
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'must contain only letters, numbers, underscores, or hyphens'
  );

export const localPublicPath = z
  .string()
  .regex(/^\/(?!\/)/, 'must be a local public path such as /images/file.png');

export const isoDate = z
  .string('must be a quoted YYYY-MM-DD string')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be a quoted YYYY-MM-DD string')
  .refine((value) => {
    const timestamp = Date.parse(`${value}T00:00:00Z`);
    return (
      Number.isFinite(timestamp) &&
      new Date(timestamp).toISOString().slice(0, 10) === value
    );
  }, 'must be a valid calendar date');

export const httpsUrl = z.url({
  protocol: /^https$/,
  error: 'must be an https:// URL',
});

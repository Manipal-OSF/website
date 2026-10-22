import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  client: {
    PUBLIC_FORUM_URL: z.url({ protocol: /^https?$/ }).optional(),
    PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }).optional(),
  },
  server: {
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }).optional(),
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    BETTER_AUTH_URL: z.url({ protocol: /^https?$/ }).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM_EMAIL: z.email().optional(),
    GITHUB_TOKEN: z.string().min(1).optional(),
  },
  runtimeEnv: {
    PUBLIC_FORUM_URL: process.env.PUBLIC_FORUM_URL,
    PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  emptyStringAsUndefined: true,
});

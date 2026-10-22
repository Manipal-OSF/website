import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import { getAuth } from './auth';
import { getDb } from './db';
import { env } from '@packages/env';
import { createForumStore } from './forum-store';

export const getForumContext = cache(async () => {
  await connection();
  if (!env.DATABASE_URL) return { store: null, viewer: null, moderator: false };
  const store = createForumStore(
    async (query) => (await getDb().execute(query)).rows,
  );
  const session =
    env.BETTER_AUTH_SECRET && env.BETTER_AUTH_URL
      ? await getAuth().api.getSession({ headers: await headers() })
      : null;
  const viewer = session?.user.id ?? null;
  return { store, viewer, moderator: await store.isModerator(viewer) };
});

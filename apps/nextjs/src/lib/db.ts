import 'server-only';
import { createDb } from '@packages/db';
import * as schema from '@packages/db/schema';
import { env } from '@packages/env';

let database: ReturnType<typeof createDb<typeof schema>> | undefined;

export function getDb() {
  if (!env.DATABASE_URL)
    throw new Error('Set DATABASE_URL before using the database.');
  return (database ??= createDb(env.DATABASE_URL, schema));
}

import { env } from '@packages/env';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type { NeonQueryFunction } from '@neondatabase/serverless';

export type Database<
  Schema extends Record<string, unknown> = Record<string, never>
> = NeonHttpDatabase<Schema> & { $client: NeonQueryFunction<false, false> };

/** Construct a client without opening a connection or running a query. */
export function createDb<
  Schema extends Record<string, unknown> = Record<string, never>
>(url: string, schema?: Schema): Database<Schema> {
  if ('window' in globalThis) {
    throw new Error('@packages/db can only be used on the server.');
  }

  let validUrl = false;
  try {
    validUrl = ['postgres:', 'postgresql:'].includes(new URL(url).protocol);
  } catch {
    // Report configuration errors without including connection credentials.
  }
  if (!validUrl) {
    throw new Error(
      'A valid PostgreSQL connection URL is required to create a database client.'
    );
  }

  return drizzle({ connection: url, schema });
}

let database: Database | undefined;

/** Convenience client for apps sharing DATABASE_URL and using direct SQL queries. */
export function getDb(): Database {
  if (!env.DATABASE_URL) {
    throw new Error('Set DATABASE_URL before using the database.');
  }

  return (database ??= createDb(env.DATABASE_URL));
}

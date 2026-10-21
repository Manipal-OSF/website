import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import type { Database } from '@packages/db';
import { betterAuth, type BetterAuthOptions } from 'better-auth/minimal';

export type AppAuthOptions = Omit<BetterAuthOptions, 'database'> & {
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
};

/** Apps own their instance, schema, origins, providers, and session policies. */
export function createAuth<
  Schema extends Record<string, unknown>,
  const Options extends AppAuthOptions
>({
  db,
  schema,
  options,
}: {
  db: Database<Schema>;
  schema: Schema;
  options: Options;
}) {
  if ('window' in globalThis) {
    throw new Error('@packages/auth can only be used on the server.');
  }
  if (!options.secret || options.secret.length < 32) {
    throw new Error('Provide an auth secret of at least 32 characters.');
  }
  if (!options.baseURL || !Array.isArray(options.trustedOrigins)) {
    throw new Error('Provide an app-specific auth baseURL and trustedOrigins.');
  }
  if (!schema || Object.keys(schema).length === 0) {
    throw new Error(
      'Provide the auth tables generated for your app configuration.'
    );
  }

  return betterAuth({
    ...options,
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema,
      // Neon HTTP does not support interactive transactions.
      transaction: false,
    }),
  });
}

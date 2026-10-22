import { betterAuth } from 'better-auth/minimal';
import { authOptions } from './src/lib/auth-options';

// Tooling only: schema generation needs the plugins, never live credentials.
// The CLI's --adapter and --dialect flags select Drizzle/PostgreSQL.
export const auth = betterAuth(authOptions);

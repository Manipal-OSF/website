import { loadRootEnv } from '@packages/env/load';
import { neon } from '@neondatabase/serverless';

const [operation, username, stage = 'dev'] = process.argv.slice(2);
if (
  !['add', 'remove'].includes(operation) ||
  !/^[a-zA-Z0-9_.]{3,30}$/.test(username ?? '') ||
  !['dev', 'prod'].includes(stage)
) {
  console.error(
    'Usage: pnpm forum:moderator <add|remove> <username> [dev|prod]',
  );
  process.exit(1);
}
loadRootEnv(stage === 'dev' ? 'development' : 'production');
const url =
  stage === 'prod'
    ? process.env.PROD_DATABASE_URL
    : process.env.DEV_DATABASE_URL;
if (!url) {
  console.error(
    `Set ${
      stage === 'prod' ? 'PROD_DATABASE_URL' : 'DEV_DATABASE_URL'
    } to manage moderators.`,
  );
  process.exit(1);
}
try {
  const sql = neon(url);
  const users =
    await sql`select id from "user" where username = ${username.toLowerCase()}`;
  if (!users.length) throw new Error('Unknown username.');
  if (operation === 'add')
    await sql`insert into forum_moderators (user_id) values (${users[0].id}) on conflict do nothing`;
  else await sql`delete from forum_moderators where user_id = ${users[0].id}`;
  console.log(
    `Moderator ${
      operation === 'add' ? 'added' : 'removed'
    } for ${username} on ${stage}.`,
  );
} catch {
  console.error(
    'Could not update moderator membership. Check the username, database configuration, and applied migrations.',
  );
  process.exit(1);
}

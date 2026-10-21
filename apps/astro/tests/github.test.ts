import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getOrgStats, withGitHubRender } from '../src/lib/github';
import { getTeam } from '../src/lib/team';

test('deduplicates GitHub requests within a render and preserves aggregate statistics', async (t) => {
  const calls = new Map<string, number>();
  t.mock.method(globalThis, 'fetch', async (input: string | URL | Request) => {
    const url = new URL(String(input));
    calls.set(url.href, (calls.get(url.href) ?? 0) + 1);
    let data: unknown = [];
    if (url.pathname === '/orgs/Manipal-OSF')
      data = { public_repos: 2, followers: 7, created_at: '2021-01-01' };
    else if (url.pathname.endsWith('/repos'))
      data = [
        {
          name: 'website',
          fork: false,
          size: 1,
          stargazers_count: 3,
          forks_count: 2,
          pushed_at: new Date().toISOString(),
        },
        {
          name: 'fork',
          fork: true,
          size: 1,
          stargazers_count: 100,
          forks_count: 100,
          pushed_at: new Date().toISOString(),
        },
      ];
    else if (url.pathname.endsWith('/languages'))
      data = { TypeScript: 900, CSS: 100, Markdown: 1000 };
    else if (url.pathname.endsWith('/commits'))
      data = [{ commit: { committer: { date: new Date().toISOString() } } }];
    return Response.json(data);
  });
  const [one, two] = await withGitHubRender(
    new Request('https://example.com'),
    () => Promise.all([getOrgStats(), getOrgStats()]),
  );
  assert.deepEqual(one, two);
  assert.equal(one?.stars, 3);
  assert.equal(one?.totalCommits, 1);
  assert.equal(one?.languages[0].share, 0.9);
  assert.ok([...calls.values()].every((count) => count === 1));
  await withGitHubRender(new Request('https://example.com'), () =>
    getOrgStats(),
  );
  assert.ok([...calls.values()].every((count) => count === 2));
});
test('GitHub outages retain the authored timeline and report unavailable data', async (t) => {
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(null, { status: 403 }),
  );
  t.mock.method(console, 'warn', () => {});
  assert.equal(await getOrgStats(), null);
  const team = await getTeam();
  assert.equal(team.unavailable, true);
  assert.ok(team.timeline.length > 0);
  assert.deepEqual(team.community, []);
});

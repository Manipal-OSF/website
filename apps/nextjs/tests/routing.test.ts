import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from 'next/experimental/testing/server';
import nextConfig from '../next.config';

test('legacy forum URLs permanently redirect without losing paths or query strings', async () => {
  for (const origin of [
    'http://localhost:3000',
    'https://forum.manipalosf.org',
  ]) {
    for (const [before, after] of [
      ['/forum', '/'],
      [
        '/forum?view=new&q=hello%20world&page=2',
        '/?view=new&q=hello%20world&page=2',
      ],
      ['/forum/comments?page=2', '/comments?page=2'],
      ['/forum/item/abcdefghijklmnop', '/item/abcdefghijklmnop'],
      [
        '/forum/user/Community.Member_1?tab=comments',
        '/user/Community.Member_1?tab=comments',
      ],
      ['/forum/submit', '/submit'],
      ['/forum/moderation', '/moderation'],
    ]) {
      const response = await unstable_getResponseFromNextConfig({
        url: `${origin}${before}`,
        nextConfig,
      });
      assert.equal(response.status, 308, before);
      const redirected = new URL(getRedirectUrl(response)!);
      const expected = new URL(after, origin);
      assert.equal(redirected.origin, origin);
      assert.equal(redirected.pathname, expected.pathname);
      assert.deepEqual(
        [...redirected.searchParams],
        [...expected.searchParams],
      );
    }
  }
});

test('current pages, auth endpoints, assets, and similarly named paths do not redirect', async () => {
  for (const path of [
    '/',
    '/?view=new',
    '/login',
    '/comments',
    '/item/abcdefghijklmnop',
    '/api/auth/get-session',
    '/_next/static/chunk.js',
    '/forumish',
  ]) {
    const response = await unstable_getResponseFromNextConfig({
      url: `https://forum.manipalosf.org${path}`,
      nextConfig,
    });
    assert.equal(response.status, 200, path);
    assert.equal(getRedirectUrl(response), null, path);
  }
});

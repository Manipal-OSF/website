import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { desc, sql } from 'drizzle-orm';
import { createForumStore, ForumError } from '../src/lib/forum-store';
import { createPublicId, safeForumReturn } from '../src/lib/forum-validation';
import * as schema from '@packages/db/schema';

test('forum with committed PostgreSQL migrations', async (t) => {
  const pg = new PGlite();
  t.after(() => pg.close());
  const db = drizzle({ client: pg, schema });
  await migrate(db, {
    migrationsFolder: new URL('../../../packages/db/drizzle', import.meta.url)
      .pathname,
  });
  await migrate(db, {
    migrationsFolder: new URL('../../../packages/db/drizzle', import.meta.url)
      .pathname,
  });
  const query = async (statement: Parameters<typeof db.execute>[0]) =>
    (await db.execute(statement)).rows;
  const store = createForumStore(query);
  await db.insert(schema.user).values(
    ['alice', 'bob', 'mod', 'spam'].map((name) => ({
      id: name,
      name,
      username: name,
      displayUsername: name.toUpperCase(),
      email: `${name}@example.test`,
    })),
  );
  await db.insert(schema.forumModerators).values({ userId: 'mod' });
  const text = {
    title: 'Building a compiler',
    kind: 'text',
    category: 'ask',
    body: 'How do parsers work?',
  };
  let post: string;
  let other: string;
  let comment: string;
  let reply: string;

  await t.test(
    'persists posts with sequential internal keys and opaque public models',
    async () => {
      post = await store.createPost('alice', text);
      other = await store.createPost('bob', {
        title: 'A useful tool',
        kind: 'link',
        category: 'show',
        url: 'https://example.org/tool',
      });
      assert.match(post, /^[a-z0-9]{16}$/);
      const records = await db.select().from(schema.forumPosts);
      assert.equal(typeof records[0].id, 'bigint');
      assert.ok(records[1].id > records[0].id);
      const result = await store.post(post, 'alice');
      assert.equal(result?.owned, true);
      assert.equal(result?.points, 1);
      assert.equal(result?.username, 'ALICE');
      assert.equal(result?.id, post);
      assert.ok(!JSON.stringify(result).includes('example.test'));
      assert.ok(!('authorId' in result!));
      assert.equal(await store.post('1'), null);
    },
  );

  await t.test(
    'rejects anonymous writes and invalid submission shapes/protocols',
    async () => {
      await assert.rejects(store.createPost(null, text), ForumError);
      await assert.rejects(
        store.createComment(null, { postId: post, body: 'x' }),
        ForumError,
      );
      await assert.rejects(
        store.vote(null, { target: 'post', id: post, voted: true }),
        ForumError,
      );
      await assert.rejects(
        store.report(null, { target: 'post', id: post, reason: 'x' }),
        ForumError,
      );
      for (const values of [
        { ...text, body: '' },
        { ...text, title: '' },
        { ...text, title: 'x'.repeat(301) },
        { ...text, kind: 'link', url: 'javascript:alert(1)', body: '' },
        { ...text, kind: 'link', url: 'https://example.org', body: '' },
        {
          ...text,
          kind: 'link',
          category: 'general',
          url: 'https://user:pass@example.org',
          body: '',
        },
      ])
        await assert.rejects(store.createPost('alice', values));
      const records = await db.select().from(schema.forumPosts);
      assert.equal(records.length, 2);
      await assert.rejects(
        db.insert(schema.forumPosts).values({
          publicId: createPublicId(),
          title: 'Invalid',
          kind: 'text',
        }),
      );
    },
  );

  await t.test(
    'threads replies, validates parents, and prevents relationship changes',
    async () => {
      comment = await store.createComment('bob', {
        postId: post,
        body: 'Start with a tokenizer.',
      });
      reply = await store.createComment('alice', {
        postId: post,
        parentId: comment,
        body: 'Thanks! https://example.org',
      });
      assert.equal((await store.post(post))?.commentCount, 2);
      const comments = (await store.comments({ postId: post })).comments;
      assert.equal(comments.find((c) => c.id === reply)?.parentId, comment);
      assert.equal(comments[0].postId, post);
      await assert.rejects(
        store.createComment('alice', {
          postId: other,
          parentId: comment,
          body: 'Wrong thread',
        }),
        /unavailable/,
      );
      const [parent] = await db.select().from(schema.forumComments);
      const records = await db.select().from(schema.forumPosts);
      await assert.rejects(
        db.insert(schema.forumComments).values({
          publicId: createPublicId(),
          postId: records[1].id,
          parentId: parent.id,
          body: 'Wrong thread',
        }),
      );
      await assert.rejects(
        db.execute(
          sql`update forum_comments set parent_id = id where public_id = ${comment}`,
        ),
        /Failed query/,
      );
    },
  );

  await t.test(
    'votes are explicit, idempotent under concurrent requests, and reflected in karma',
    async () => {
      await assert.rejects(
        store.vote('alice', { target: 'post', id: post, voted: true }),
        /cannot vote/,
      );
      await Promise.all(
        Array.from({ length: 6 }, () =>
          store.vote('bob', { target: 'post', id: post, voted: true }),
        ),
      );
      assert.equal((await store.post(post, 'bob'))?.points, 2);
      assert.equal((await store.post(post, 'bob'))?.voted, true);
      assert.equal((await store.member('ALICE'))?.karma, 1);
      await store.vote('bob', { target: 'post', id: post, voted: false });
      await store.vote('bob', { target: 'post', id: post, voted: false });
      assert.equal((await store.member('alice'))?.karma, 0);
      await store.vote('alice', {
        target: 'comment',
        id: comment,
        voted: true,
      });
      assert.equal((await store.member('bob'))?.karma, 1);
      await store.vote('alice', {
        target: 'comment',
        id: comment,
        voted: false,
      });
      assert.equal((await store.member('bob'))?.karma, 0);
    },
  );

  await t.test('feeds filter, search, and rank with age decay', async () => {
    assert.deepEqual(
      (await store.feed({ view: 'ask' })).posts.map((p) => p.id),
      [post],
    );
    assert.deepEqual(
      (await store.feed({ view: 'show' })).posts.map((p) => p.id),
      [other],
    );
    assert.deepEqual(
      (await store.feed({ q: 'parsers' })).posts.map((p) => p.id),
      [post],
    );
    assert.equal((await store.feed({ q: 'nonexistent' })).posts.length, 0);
    await db.execute(
      sql`update forum_posts set created_at = now() - interval '10 days' where public_id = ${post}`,
    );
    await store.vote('bob', { target: 'post', id: post, voted: true });
    assert.equal((await store.feed()).posts[0].id, other);
    assert.equal((await store.feed({ username: 'alice' })).posts.length, 1);
    assert.equal(
      (await store.comments({ username: 'alice' })).comments.length,
      1,
    );
  });

  await t.test(
    'editing checks ownership and keeps the selected kind valid',
    async () => {
      await assert.rejects(
        store.edit('bob', { target: 'post', id: post, ...text }),
        /cannot edit/,
      );
      await store.edit('alice', {
        target: 'post',
        id: post,
        ...text,
        title: 'Compiler questions',
      });
      assert.equal((await store.post(post))?.title, 'Compiler questions');
      await store.edit('bob', {
        target: 'comment',
        id: comment,
        body: 'Updated advice',
      });
      assert.equal(
        (await store.comments({ postId: post })).comments.find(
          (c) => c.id === comment,
        )?.body,
        'Updated advice',
      );
      await assert.rejects(
        store.remove('alice', { target: 'comment', id: comment }),
        /cannot delete/,
      );
    },
  );

  await t.test(
    'reports deduplicate and moderator decisions commit with an audit',
    async () => {
      await store.report('bob', {
        target: 'post',
        id: post,
        reason: 'Please review',
      });
      await store.report('bob', {
        target: 'post',
        id: post,
        reason: 'Duplicate',
      });
      await assert.rejects(store.reports('alice'), /Moderator/);
      assert.equal((await store.reports('mod')).reports.length, 1);
      const [report] = (await store.reports('mod')).reports;
      await assert.rejects(
        store.moderate('alice', {
          target: 'post',
          id: post,
          operation: 'hide',
          reason: 'No permission',
        }),
        /Moderator/,
      );
      assert.equal(
        (await db.select().from(schema.forumModerationActions)).length,
        0,
      );
      await store.moderate('mod', {
        target: 'post',
        id: post,
        operation: 'hide',
        reason: 'Reviewed',
        reportId: report.id,
      });
      assert.equal((await store.reports('mod')).reports.length, 0);
      assert.equal(
        (await store.feed()).posts.some((p) => p.id === post),
        false,
      );
      assert.equal((await store.post(post))?.title, '[hidden]');
      assert.equal((await store.post(post))?.body, null);
      assert.equal((await store.comments({ postId: post })).comments.length, 0);
      assert.equal((await store.member('alice'))?.karma, 0);
      await assert.rejects(
        store.createComment('bob', { postId: post, body: 'Hidden' }),
        /unavailable/,
      );
      await assert.rejects(
        store.vote('bob', { target: 'post', id: post, voted: true }),
        /cannot vote/,
      );
      await store.moderate('mod', {
        target: 'post',
        id: post,
        operation: 'restore',
        reason: 'Restored',
      });
      assert.equal((await store.post(post))?.hidden, false);
      const audits = await db.select().from(schema.forumModerationActions);
      assert.equal(audits.length, 2);
      assert.equal(audits[0].reportId?.toString(), report.id);
      await store.report('alice', {
        target: 'comment',
        id: comment,
        reason: 'Review this reply',
      });
      const [commentReport] = (await store.reports('mod')).reports;
      await store.moderate('mod', {
        target: 'comment',
        id: comment,
        operation: 'dismiss',
        reportId: commentReport.id,
        reason: 'Allowed',
      });
      assert.equal((await store.reports('mod')).reports.length, 0);
      assert.equal(
        (await store.comments({ postId: post })).comments.find(
          (c) => c.id === comment,
        )?.hidden,
        false,
      );
    },
  );

  await t.test(
    'hidden comments preserve descendants; locked threads reject replies',
    async () => {
      await store.moderate('mod', {
        target: 'comment',
        id: comment,
        operation: 'hide',
        reason: 'Moderated',
      });
      const comments = (await store.comments({ postId: post })).comments;
      assert.equal(comments.find((c) => c.id === comment)?.body, '[hidden]');
      assert.equal(comments.find((c) => c.id === reply)?.parentId, comment);
      await assert.rejects(
        store.vote('alice', { target: 'comment', id: comment, voted: true }),
        /cannot vote/,
      );
      await assert.rejects(
        store.createComment('alice', {
          postId: post,
          parentId: comment,
          body: 'No',
        }),
        /unavailable/,
      );
      await store.moderate('mod', {
        target: 'comment',
        id: comment,
        operation: 'restore',
        reason: 'Restored',
      });
      await store.moderate('mod', {
        target: 'post',
        id: post,
        operation: 'lock',
        reason: 'Pause replies',
      });
      await assert.rejects(
        store.createComment('bob', { postId: post, body: 'Locked' }),
        /locked/,
      );
      await assert.rejects(
        store.createComment('bob', {
          postId: post,
          parentId: reply,
          body: 'Locked',
        }),
        /locked/,
      );
      await store.moderate('mod', {
        target: 'post',
        id: post,
        operation: 'unlock',
        reason: 'Open',
      });
      await store.createComment('bob', { postId: post, body: 'Open again' });
    },
  );

  await t.test(
    'soft deletion preserves threads and prevents new interactions',
    async () => {
      await store.remove('bob', { target: 'comment', id: comment });
      assert.equal(
        (await store.comments({ postId: post })).comments.find(
          (c) => c.id === comment,
        )?.body,
        '[deleted]',
      );
      assert.ok(
        (await store.comments({ postId: post })).comments.some(
          (c) => c.id === reply,
        ),
      );
      await store.remove('alice', { target: 'post', id: post });
      assert.equal((await store.post(post))?.title, '[deleted]');
      assert.equal(
        (await store.feed()).posts.some((p) => p.id === post),
        false,
      );
      assert.ok((await store.comments({ postId: post })).comments.length > 0);
      await assert.rejects(
        store.createComment('bob', { postId: post, body: 'Deleted' }),
        /unavailable/,
      );
      await assert.rejects(
        store.edit('alice', { target: 'post', id: post, ...text }),
        /cannot edit/,
      );
    },
  );

  await t.test(
    'public ID collisions retry only the relevant unique constraint',
    async () => {
      let calls = 0;
      const collisionStore = createForumStore(query, () =>
        ++calls === 1 ? other : createPublicId(),
      );
      const id = await collisionStore.createPost('alice', text);
      assert.notEqual(id, other);
      assert.equal(calls, 2);
      const exhausted = createForumStore(query, () => other);
      await assert.rejects(exhausted.createPost('alice', text), /unique ID/);
    },
  );

  await t.test(
    'write limits are atomic across simultaneous requests',
    async () => {
      const results = await Promise.allSettled(
        Array.from({ length: 7 }, () => store.createPost('spam', text)),
      );
      assert.equal(results.filter((r) => r.status === 'fulfilled').length, 5);
      assert.equal(results.filter((r) => r.status === 'rejected').length, 2);
      const rates = await query(
        sql`select count from forum_write_limits where user_id = 'spam' and action = 'post'`,
      );
      assert.equal(rates[0].count, 5);
    },
  );

  await t.test(
    'BIGINT precision and feed pagination survive large identity values',
    async () => {
      await db.execute(
        sql`alter sequence forum_posts_id_seq restart with 9007199254740993`,
      );
      await db.execute(sql`insert into forum_posts (public_id, title, kind, body)
      select lpad(i::text, 16, '0'), 'Pagination ' || i, 'text', 'Seeded discussion' from generate_series(1, 35) i`);
      const first = await store.feed({ view: 'new' });
      const second = await store.feed({ view: 'new', page: 2 });
      assert.equal(first.posts.length, 30);
      assert.equal(first.more, true);
      assert.ok(second.posts.length > 0);
      assert.equal(
        new Set([...first.posts, ...second.posts].map((p) => p.id)).size,
        first.posts.length + second.posts.length,
      );
      const [row] = await db
        .select()
        .from(schema.forumPosts)
        .orderBy(desc(schema.forumPosts.id))
        .limit(1);
      assert.equal(row.id.toString(), '9007199254741027');
      await store.vote('alice', {
        target: 'post',
        id: row.publicId,
        voted: true,
      });
      assert.equal((await store.post(row.publicId))?.points, 2);
      assert.doesNotThrow(() => JSON.stringify(first));
    },
  );

  await t.test(
    'account removal keeps authored discussions and clears votes/moderation',
    async () => {
      await db.execute(sql`delete from "user" where id = 'bob'`);
      assert.equal((await store.post(other))?.username, null);
      assert.equal((await store.post(other))?.title, 'A useful tool');
      await db.execute(sql`delete from "user" where id = 'mod'`);
      assert.equal(await store.isModerator('mod'), false);
      assert.ok(
        (await db.select().from(schema.forumModerationActions)).length > 0,
      );
    },
  );
});

test('login returns only to local forum URLs', () => {
  for (const value of [
    'https://evil.test/forum',
    '//evil.test/forum',
    '/blog',
    '/forum/../login',
    '/forum\\evil',
    '/forum\n',
    null,
  ])
    assert.equal(safeForumReturn(value), '/forum');
  assert.equal(
    safeForumReturn('/forum/item/abcdefghijklmnop#comment-abcdefghijklmnop'),
    '/forum/item/abcdefghijklmnop#comment-abcdefghijklmnop',
  );
  assert.equal(safeForumReturn('/forum?view=new'), '/forum?view=new');
});

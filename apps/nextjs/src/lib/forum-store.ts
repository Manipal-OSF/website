import { sql, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import type {
  ForumComment,
  ForumMember,
  ForumPost,
  ForumReport,
  ForumTarget,
  ForumView,
} from '../types/forum';
import {
  commentInput,
  createPublicId,
  moderationInput,
  postInput,
  publicIdSchema,
  reportInput,
  targetInput,
} from './forum-validation';

type Row = Record<string, unknown>;
export type ForumQuery = (query: SQL) => Promise<Row[]>;
export class ForumError extends Error {}
const visible = sql`deleted_at is null and hidden_at is null`;
const pageSize = 30;
export function forumPage(value: unknown) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10000) : 1;
}
function authenticated(userId: string | null): asserts userId is string {
  if (!userId) throw new ForumError('Log in to participate.');
}
function dates<T>(rows: Row[]): T[] {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        (key === 'createdAt' || key === 'updatedAt') && value
          ? new Date(value as string).toISOString()
          : value,
      ]),
    ),
  ) as T[];
}
function uniqueCollision(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; constraint?: string; cause?: unknown };
  return (
    (e.code === '23505' &&
      [
        'forum_posts_public_id_unique',
        'forum_comments_public_id_unique',
      ].includes(e.constraint ?? '')) ||
    !!(e.cause && uniqueCollision(e.cause))
  );
}

/** Database-independent SQL service, shared by Neon runtime and real PostgreSQL tests. */
export function createForumStore(
  query: ForumQuery,
  generateId = createPublicId,
) {
  async function rate(userId: string, action: string) {
    const [seconds, maximum] = (
      {
        post: [600, 5],
        comment: [600, 20],
        vote: [60, 60],
        report: [3600, 10],
        edit: [600, 30],
        moderate: [60, 60],
      } as Record<string, number[]>
    )[action];
    const result = await query(sql`
      with cleanup as (delete from forum_write_limits where user_id = ${userId} and bucket_start < now() - interval '1 day')
      insert into forum_write_limits (user_id, action, bucket_start, count)
      values (${userId}, ${action}, to_timestamp(floor(extract(epoch from now()) / ${seconds}) * ${seconds}), 1)
      on conflict (user_id, action, bucket_start) do update set count = forum_write_limits.count + 1
      where forum_write_limits.count < ${maximum} returning count`);
    if (!result.length)
      throw new ForumError(
        'You are doing that too often. Please try again later.',
      );
  }
  async function withId(insert: (id: string) => Promise<Row[]>) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await insert(publicIdSchema.parse(generateId()));
      } catch (error) {
        if (!uniqueCollision(error)) throw error;
      }
    }
    throw new ForumError('Could not create a unique ID. Please try again.');
  }
  function postFields(viewer: string | null) {
    return sql`p.public_id as id,
      case when p.deleted_at is not null then '[deleted]' when p.hidden_at is not null then '[hidden]' else p.title end as title,
      p.kind, p.category,
      case when p.deleted_at is null and p.hidden_at is null then p.url else null end as url,
      case when p.deleted_at is null and p.hidden_at is null then p.body else null end as body,
      coalesce(u.display_username, u.username) as username, p.created_at as "createdAt", p.updated_at as "updatedAt",
      greatest(0, floor(extract(epoch from (now() - p.created_at)) / 60))::int as "ageMinutes",
      (1 + (select count(*) from forum_post_votes v where v.post_id = p.id))::int as points,
      (select count(*) from forum_comments c where c.post_id = p.id and c.deleted_at is null and c.hidden_at is null)::int as "commentCount",
      exists(select 1 from forum_post_votes v where v.post_id = p.id and v.user_id = ${viewer}) as voted,
      coalesce(p.author_id = ${viewer}, false) as owned, (p.deleted_at is not null) as deleted,
      (p.hidden_at is not null) as hidden, (p.locked_at is not null) as locked`;
  }
  function commentFields(viewer: string | null) {
    return sql`c.public_id as id, p.public_id as "postId", p.title as "postTitle", parent.public_id as "parentId",
      coalesce(u.display_username, u.username) as username,
      case when c.deleted_at is not null then '[deleted]' when c.hidden_at is not null then '[hidden]' else c.body end as body,
      c.created_at as "createdAt", c.updated_at as "updatedAt",
      greatest(0, floor(extract(epoch from (now() - c.created_at)) / 60))::int as "ageMinutes",
      (1 + (select count(*) from forum_comment_votes v where v.comment_id = c.id))::int as points,
      exists(select 1 from forum_comment_votes v where v.comment_id = c.id and v.user_id = ${viewer}) as voted,
      coalesce(c.author_id = ${viewer}, false) as owned, (c.deleted_at is not null) as deleted,
      (c.hidden_at is not null) as hidden, (p.locked_at is not null or p.deleted_at is not null) as locked`;
  }
  const commentJoins = sql`from forum_comments c join forum_posts p on p.id = c.post_id
    left join forum_comments parent on parent.id = c.parent_id left join "user" u on u.id = c.author_id`;

  // Lock the containing post before its target. All content mutations use this order.
  // FOR UPDATE rechecks the current row after concurrent visibility changes.
  function lockedTarget(target: ForumTarget, id: string) {
    if (target === 'post')
      return sql`locked_post as materialized (
      select p.* from forum_posts p where p.public_id = ${id} for update),
      target as materialized (select p.* from locked_post p)`;
    return sql`locked_post as materialized (
      select p.* from forum_posts p join forum_comments c on c.post_id = p.id where c.public_id = ${id} for update of p),
      target as materialized (select c.* from forum_comments c join locked_post p on p.id = c.post_id where c.public_id = ${id} for update of c)`;
  }
  const allowedPost = sql`exists (select 1 from locked_post where ${visible})`;

  return {
    async isModerator(userId: string | null) {
      if (!userId) return false;
      return (
        (
          await query(
            sql`select 1 from forum_moderators where user_id = ${userId}`,
          )
        ).length > 0
      );
    },
    async feed(
      options: {
        viewer?: string | null;
        view?: ForumView;
        page?: number;
        q?: string;
        username?: string;
      } = {},
    ) {
      const { viewer = null, view = 'top', username } = options;
      const page = forumPage(options.page);
      const search = options.q?.trim().slice(0, 200) || '';
      const rows = await query(sql`select ${postFields(
        viewer,
      )} from forum_posts p left join "user" u on u.id = p.author_id
        where p.deleted_at is null and p.hidden_at is null
        ${
          view === 'ask' || view === 'show'
            ? sql`and p.category = ${view}`
            : sql``
        }
        ${username ? sql`and u.username = ${username.toLowerCase()}` : sql``}
        ${
          search
            ? sql`and to_tsvector('simple', p.title || ' ' || coalesce(p.body, '')) @@ websearch_to_tsquery('simple', ${search})`
            : sql``
        }
        order by ${
          view === 'new' || username
            ? sql`p.created_at desc nulls last, p.id desc nulls last`
            : sql`((1 + (select count(*) from forum_post_votes v where v.post_id = p.id)) / power(greatest(0, extract(epoch from (now() - p.created_at)) / 3600) + 2, 1.8)) desc, p.created_at desc nulls last, p.id desc nulls last`
        }
        limit ${pageSize + 1} offset ${(page - 1) * pageSize}`);
      return {
        posts: dates<ForumPost>(rows.slice(0, pageSize)),
        more: rows.length > pageSize,
        page,
      };
    },
    async post(id: string, viewer: string | null = null) {
      if (!publicIdSchema.safeParse(id).success) return null;
      return (
        dates<ForumPost>(
          await query(
            sql`select ${postFields(
              viewer,
            )} from forum_posts p left join "user" u on u.id = p.author_id where p.public_id = ${id}`,
          ),
        )[0] ?? null
      );
    },
    async comments(
      options: {
        postId?: string;
        viewer?: string | null;
        username?: string;
        page?: number;
      } = {},
    ) {
      const { viewer = null, postId, username } = options;
      const page = forumPage(options.page);
      const rows = await query(sql`select ${commentFields(
        viewer,
      )} ${commentJoins}
        where p.hidden_at is null
        ${
          postId
            ? sql`and p.public_id = ${postId}`
            : sql`and p.deleted_at is null and c.deleted_at is null and c.hidden_at is null`
        }
        ${username ? sql`and u.username = ${username.toLowerCase()}` : sql``}
        order by ${
          postId
            ? sql`points desc, c.created_at, c.id`
            : sql`c.created_at desc nulls last, c.id desc nulls last`
        }
        ${
          postId
            ? sql``
            : sql`limit ${pageSize + 1} offset ${(page - 1) * pageSize}`
        }`);
      return {
        comments: dates<ForumComment>(postId ? rows : rows.slice(0, pageSize)),
        more: !postId && rows.length > pageSize,
        page,
      };
    },
    async member(username: string) {
      return (
        dates<ForumMember>(
          await query(sql`select coalesce(u.display_username, u.username) as username, u.created_at as "createdAt",
        ((select count(*) from forum_post_votes v join forum_posts p on p.id = v.post_id where p.author_id = u.id and v.user_id <> u.id and p.deleted_at is null and p.hidden_at is null)
        + (select count(*) from forum_comment_votes v join forum_comments c on c.id = v.comment_id join forum_posts p on p.id = c.post_id where c.author_id = u.id and v.user_id <> u.id and c.deleted_at is null and c.hidden_at is null and p.deleted_at is null and p.hidden_at is null))::int as karma
        from "user" u where u.username = ${username.toLowerCase()}`),
        )[0] ?? null
      );
    },
    async createPost(userId: string | null, input: unknown) {
      authenticated(userId);
      const value = postInput.parse(input);
      await rate(userId, 'post');
      const rows = await withId((id) =>
        query(sql`insert into forum_posts (public_id, author_id, title, kind, category, url, body)
        values (${id}, ${userId}, ${value.title}, ${value.kind}, ${
          value.category
        }, ${value.kind === 'link' ? value.url : null}, ${
          value.kind === 'text' ? value.body : null
        }) returning public_id as id`),
      );
      return String(rows[0].id);
    },
    async createComment(userId: string | null, input: unknown) {
      authenticated(userId);
      const value = commentInput.parse(input);
      await rate(userId, 'comment');
      const rows = await withId((id) =>
        query(sql`with locked_post as materialized (
          select * from forum_posts where public_id = ${
            value.postId
          } for update),
        parent as materialized (select c.* from forum_comments c join locked_post p on p.id = c.post_id where c.public_id = ${
          value.parentId ?? null
        } for update of c)
        insert into forum_comments (public_id, post_id, parent_id, author_id, body)
        select ${id}, p.id, (select id from parent), ${userId}, ${
          value.body
        } from locked_post p
        where p.deleted_at is null and p.hidden_at is null and p.locked_at is null
        ${
          value.parentId
            ? sql`and exists(select 1 from parent where ${visible})`
            : sql``
        }
        returning public_id as id`),
      );
      if (!rows.length)
        throw new ForumError(
          'This discussion or reply is unavailable or locked.',
        );
      return String(rows[0].id);
    },
    async vote(userId: string | null, input: unknown) {
      authenticated(userId);
      const value = targetInput.extend({ voted: z.boolean() }).parse(input);
      await rate(userId, 'vote');
      const votes =
        value.target === 'post'
          ? sql`forum_post_votes`
          : sql`forum_comment_votes`;
      const foreign = value.target === 'post' ? sql`post_id` : sql`comment_id`;
      const mutation = value.voted
        ? sql`insert into ${votes} (${foreign}, user_id) select id, ${userId} from target where ${visible} and author_id is distinct from ${userId} and ${allowedPost} on conflict do nothing returning ${foreign}`
        : sql`delete from ${votes} using target t where ${foreign} = t.id and user_id = ${userId} and t.deleted_at is null and t.hidden_at is null and ${allowedPost} returning ${foreign}`;
      const rows = await query(sql`with ${lockedTarget(
        value.target,
        value.id,
      )}, changed as (${mutation})
        select exists(select 1 from target where ${visible} and author_id is distinct from ${userId} and ${allowedPost}) as allowed`);
      if (!rows[0]?.allowed)
        throw new ForumError('You cannot vote on this content.');
    },
    async edit(userId: string | null, input: unknown) {
      authenticated(userId);
      const value = targetInput
        .extend({
          body: z.string().default(''),
          title: z.string().default(''),
          kind: z.enum(['link', 'text']).optional(),
          category: z.enum(['general', 'ask', 'show']).optional(),
          url: z.string().default(''),
        })
        .parse(input);
      const post = value.target === 'post' ? postInput.parse(value) : null;
      const body =
        value.target === 'comment'
          ? z.string().trim().min(1).max(10000).parse(value.body)
          : '';
      await rate(userId, 'edit');
      const rows = await query(sql`with ${lockedTarget(value.target, value.id)}
        update ${
          value.target === 'post' ? sql`forum_posts` : sql`forum_comments`
        } as content
        set ${
          post
            ? sql`title = ${post.title}, kind = ${post.kind}, category = ${
                post.category
              }, url = ${post.kind === 'link' ? post.url : null}, body = ${
                post.kind === 'text' ? post.body : null
              }`
            : sql`body = ${body}`
        }, updated_at = now()
        from target t where content.id = t.id and t.author_id = ${userId} and t.deleted_at is null and t.hidden_at is null and ${allowedPost}
        returning content.public_id`);
      if (!rows.length) throw new ForumError('You cannot edit this content.');
    },
    async remove(userId: string | null, input: unknown) {
      authenticated(userId);
      const value = targetInput.parse(input);
      await rate(userId, 'edit');
      const rows = await query(sql`with ${lockedTarget(value.target, value.id)}
        update ${
          value.target === 'post' ? sql`forum_posts` : sql`forum_comments`
        } as content set deleted_at = now(), updated_at = now()
        from target t where content.id = t.id and t.author_id = ${userId} and t.deleted_at is null returning content.public_id`);
      if (!rows.length) throw new ForumError('You cannot delete this content.');
    },
    async report(userId: string | null, input: unknown) {
      authenticated(userId);
      const value = reportInput.parse(input);
      await rate(userId, 'report');
      const rows = await query(sql`with ${lockedTarget(
        value.target,
        value.id,
      )}, reported as (
        insert into forum_reports (reporter_id, ${
          value.target === 'post' ? sql`post_id` : sql`comment_id`
        }, reason)
        select ${userId}, id, ${
          value.reason
        } from target where ${visible} and ${allowedPost} on conflict do nothing returning id)
        select exists(select 1 from target where ${visible} and ${allowedPost}) as allowed`);
      if (!rows[0]?.allowed)
        throw new ForumError('This content is unavailable.');
    },
    async reports(userId: string | null, page = 1) {
      authenticated(userId);
      if (!(await this.isModerator(userId)))
        throw new ForumError('Moderator access required.');
      const rows =
        await query(sql`select r.id::text as id, case when r.comment_id is null then 'post' else 'comment' end as target,
        coalesce(c.public_id, p.public_id) as "targetId", p.public_id as "postId", p.title, c.body,
        r.reason, coalesce(u.display_username, u.username) as username, r.created_at as "createdAt"
        from forum_reports r left join forum_comments c on c.id = r.comment_id
        join forum_posts p on p.id = coalesce(r.post_id, c.post_id) left join "user" u on u.id = r.reporter_id
        where r.status = 'open' order by r.created_at, r.id limit 31 offset ${
          (forumPage(page) - 1) * pageSize
        }`);
      return {
        reports: dates<ForumReport>(rows.slice(0, pageSize)),
        more: rows.length > pageSize,
      };
    },
    async moderate(userId: string | null, input: unknown) {
      authenticated(userId);
      const value = moderationInput.parse(input);
      await rate(userId, 'moderate');
      const table =
        value.target === 'post' ? sql`forum_posts` : sql`forum_comments`;
      const targetColumn =
        value.target === 'post' ? sql`post_id` : sql`comment_id`;
      const assignment =
        value.operation === 'hide'
          ? sql`hidden_at = now()`
          : value.operation === 'restore'
            ? sql`hidden_at = null`
            : value.operation === 'lock'
              ? sql`locked_at = now()`
              : sql`locked_at = null`;
      // One statement commits visibility, report resolution, and audit together.
      const rows = await query(sql`with ${lockedTarget(value.target, value.id)},
        permission as materialized (select * from forum_moderators where user_id = ${userId} for share),
        selected_report as materialized (select r.* from forum_reports r join target t on r.${targetColumn} = t.id where r.id = ${
          value.reportId ?? null
        }::bigint and r.status = 'open' for update of r),
        authorized as materialized (select t.id from target t where exists(select 1 from permission)
          ${
            value.reportId
              ? sql`and exists(select 1 from selected_report)`
              : sql``
          }),
        changed as (${
          value.operation === 'dismiss'
            ? sql`select id from authorized`
            : sql`update ${table} c set ${assignment} from authorized a where c.id = a.id returning c.id`
        }),
        reviewed as (update forum_reports r set status = ${
          value.operation === 'dismiss' ? 'dismissed' : 'resolved'
        }, reviewer_id = ${userId}, reviewed_at = now()
          where r.id in (select id from selected_report) and exists(select 1 from changed) returning r.id)
        insert into forum_moderation_actions (moderator_id, ${targetColumn}, report_id, action, reason)
        select ${userId}, id, (select id from reviewed), ${value.operation}, ${
          value.reason
        } from changed returning id::text`);
      if (!rows.length)
        throw new ForumError(
          'Moderator access required, or the report/content is no longer available.',
        );
    },
  };
}

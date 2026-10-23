import { sql } from 'drizzle-orm';
import {
  pgTable,
  bigint,
  text,
  varchar,
  timestamp,
  integer,
  primaryKey,
  index,
  uniqueIndex,
  unique,
  check,
  foreignKey,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { user } from './auth';

const identity = () =>
  bigint('id', { mode: 'bigint' }).generatedAlwaysAsIdentity().primaryKey();
const publicId = () => varchar('public_id', { length: 16 }).notNull().unique();
const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).defaultNow().notNull();
const author = () =>
  text('author_id').references(() => user.id, { onDelete: 'set null' });

export const forumPosts = pgTable(
  'forum_posts',
  {
    id: identity(),
    publicId: publicId(),
    authorId: author(),
    title: text('title').notNull(),
    kind: text('kind').notNull(),
    category: text('category').notNull().default('general'),
    url: text('url'),
    body: text('body'),
    createdAt: createdAt(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    hiddenAt: timestamp('hidden_at', { withTimezone: true }),
    lockedAt: timestamp('locked_at', { withTimezone: true }),
  },
  (t) => [
    check(
      'forum_posts_public_id_format',
      sql`${t.publicId} ~ '^[a-z0-9]{16}$'`,
    ),
    check(
      'forum_posts_title_length',
      sql`char_length(btrim(${t.title})) between 1 and 300`,
    ),
    check(
      'forum_posts_category',
      sql`${t.category} in ('general', 'ask', 'show')`,
    ),
    check(
      'forum_posts_content',
      sql`(${t.kind} = 'link' and ${t.url} is not null and ${t.url} ~ '^https?://' and char_length(${t.url}) <= 2048 and ${t.body} is null and ${t.category} <> 'ask') or (${t.kind} = 'text' and ${t.url} is null and ${t.body} is not null and char_length(btrim(${t.body})) between 1 and 20000)`,
    ),
    index('forum_posts_new_idx')
      .on(t.createdAt.desc(), t.id.desc())
      .where(sql`${t.deletedAt} is null and ${t.hiddenAt} is null`),
    index('forum_posts_category_idx')
      .on(t.category, t.createdAt.desc(), t.id.desc())
      .where(sql`${t.deletedAt} is null and ${t.hiddenAt} is null`),
    index('forum_posts_author_idx').on(
      t.authorId,
      t.createdAt.desc(),
      t.id.desc(),
    ),
    index('forum_posts_search_idx').using(
      'gin',
      sql`to_tsvector('simple', ${t.title} || ' ' || coalesce(${t.body}, ''))`,
    ),
  ],
);

export const forumComments = pgTable(
  'forum_comments',
  {
    id: identity(),
    publicId: publicId(),
    postId: bigint('post_id', { mode: 'bigint' })
      .notNull()
      .references(() => forumPosts.id),
    parentId: bigint('parent_id', { mode: 'bigint' }).references(
      (): AnyPgColumn => forumComments.id,
    ),
    authorId: author(),
    body: text('body').notNull(),
    createdAt: createdAt(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    hiddenAt: timestamp('hidden_at', { withTimezone: true }),
  },
  (t) => [
    check(
      'forum_comments_public_id_format',
      sql`${t.publicId} ~ '^[a-z0-9]{16}$'`,
    ),
    check(
      'forum_comments_body_length',
      sql`char_length(btrim(${t.body})) between 1 and 10000`,
    ),
    unique('forum_comments_id_post_unique').on(t.id, t.postId),
    foreignKey({
      name: 'forum_comments_parent_post_fk',
      columns: [t.parentId, t.postId],
      foreignColumns: [t.id, t.postId],
    }),
    index('forum_comments_tree_idx').on(
      t.postId,
      t.parentId,
      t.createdAt,
      t.id,
    ),
    index('forum_comments_author_idx').on(
      t.authorId,
      t.createdAt.desc(),
      t.id.desc(),
    ),
    index('forum_comments_recent_idx')
      .on(t.createdAt.desc(), t.id.desc())
      .where(sql`${t.deletedAt} is null and ${t.hiddenAt} is null`),
  ],
);

export const forumPostVotes = pgTable(
  'forum_post_votes',
  {
    postId: bigint('post_id', { mode: 'bigint' })
      .notNull()
      .references(() => forumPosts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.userId] }),
    index('forum_post_votes_user_idx').on(t.userId),
  ],
);

export const forumCommentVotes = pgTable(
  'forum_comment_votes',
  {
    commentId: bigint('comment_id', { mode: 'bigint' })
      .notNull()
      .references(() => forumComments.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [
    primaryKey({ columns: [t.commentId, t.userId] }),
    index('forum_comment_votes_user_idx').on(t.userId),
  ],
);

export const forumModerators = pgTable('forum_moderators', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
});

export const forumReports = pgTable(
  'forum_reports',
  {
    id: identity(),
    reporterId: text('reporter_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    postId: bigint('post_id', { mode: 'bigint' }).references(
      () => forumPosts.id,
    ),
    commentId: bigint('comment_id', { mode: 'bigint' }).references(
      () => forumComments.id,
    ),
    reason: text('reason').notNull(),
    status: text('status').notNull().default('open'),
    reviewerId: text('reviewer_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: createdAt(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  },
  (t) => [
    check(
      'forum_reports_target',
      sql`num_nonnulls(${t.postId}, ${t.commentId}) = 1`,
    ),
    check(
      'forum_reports_reason',
      sql`char_length(btrim(${t.reason})) between 1 and 1000`,
    ),
    check(
      'forum_reports_status',
      sql`${t.status} in ('open', 'resolved', 'dismissed')`,
    ),
    uniqueIndex('forum_reports_post_unique')
      .on(t.reporterId, t.postId)
      .where(sql`${t.postId} is not null`),
    uniqueIndex('forum_reports_comment_unique')
      .on(t.reporterId, t.commentId)
      .where(sql`${t.commentId} is not null`),
    index('forum_reports_open_idx')
      .on(t.createdAt, t.id)
      .where(sql`${t.status} = 'open'`),
  ],
);

export const forumModerationActions = pgTable(
  'forum_moderation_actions',
  {
    id: identity(),
    moderatorId: text('moderator_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    postId: bigint('post_id', { mode: 'bigint' }).references(
      () => forumPosts.id,
    ),
    commentId: bigint('comment_id', { mode: 'bigint' }).references(
      () => forumComments.id,
    ),
    reportId: bigint('report_id', { mode: 'bigint' }).references(
      () => forumReports.id,
    ),
    action: text('action').notNull(),
    reason: text('reason').notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    check(
      'forum_moderation_action',
      sql`${t.action} in ('hide', 'restore', 'lock', 'unlock', 'dismiss')`,
    ),
    check(
      'forum_moderation_target',
      sql`num_nonnulls(${t.postId}, ${t.commentId}) = 1`,
    ),
  ],
);

export const forumWriteLimits = pgTable(
  'forum_write_limits',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    action: text('action').notNull(),
    bucketStart: timestamp('bucket_start', { withTimezone: true }).notNull(),
    count: integer('count').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.action, t.bucketStart] })],
);

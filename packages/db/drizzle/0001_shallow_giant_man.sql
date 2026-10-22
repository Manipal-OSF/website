CREATE TABLE "forum_comment_votes" (
	"comment_id" bigint NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_comment_votes_comment_id_user_id_pk" PRIMARY KEY("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "forum_comments" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "forum_comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" varchar(16) NOT NULL,
	"post_id" bigint NOT NULL,
	"parent_id" bigint,
	"author_id" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"hidden_at" timestamp with time zone,
	CONSTRAINT "forum_comments_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "forum_comments_id_post_unique" UNIQUE("id","post_id"),
	CONSTRAINT "forum_comments_public_id_format" CHECK ("forum_comments"."public_id" ~ '^[a-z0-9]{16}$'),
	CONSTRAINT "forum_comments_body_length" CHECK (char_length(btrim("forum_comments"."body")) between 1 and 10000)
);
--> statement-breakpoint
CREATE TABLE "forum_moderation_actions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "forum_moderation_actions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"moderator_id" text,
	"post_id" bigint,
	"comment_id" bigint,
	"report_id" bigint,
	"action" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_moderation_action" CHECK ("forum_moderation_actions"."action" in ('hide', 'restore', 'lock', 'unlock', 'dismiss')),
	CONSTRAINT "forum_moderation_target" CHECK (num_nonnulls("forum_moderation_actions"."post_id", "forum_moderation_actions"."comment_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "forum_moderators" (
	"user_id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_post_votes" (
	"post_id" bigint NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forum_post_votes_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "forum_posts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" varchar(16) NOT NULL,
	"author_id" text,
	"title" text NOT NULL,
	"kind" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"url" text,
	"body" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"hidden_at" timestamp with time zone,
	"locked_at" timestamp with time zone,
	CONSTRAINT "forum_posts_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "forum_posts_public_id_format" CHECK ("forum_posts"."public_id" ~ '^[a-z0-9]{16}$'),
	CONSTRAINT "forum_posts_title_length" CHECK (char_length(btrim("forum_posts"."title")) between 1 and 300),
	CONSTRAINT "forum_posts_category" CHECK ("forum_posts"."category" in ('general', 'ask', 'show')),
	CONSTRAINT "forum_posts_content" CHECK (("forum_posts"."kind" = 'link' and "forum_posts"."url" is not null and "forum_posts"."url" ~ '^https?://' and char_length("forum_posts"."url") <= 2048 and "forum_posts"."body" is null and "forum_posts"."category" <> 'ask') or ("forum_posts"."kind" = 'text' and "forum_posts"."url" is null and "forum_posts"."body" is not null and char_length(btrim("forum_posts"."body")) between 1 and 20000))
);
--> statement-breakpoint
CREATE TABLE "forum_reports" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "forum_reports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"reporter_id" text,
	"post_id" bigint,
	"comment_id" bigint,
	"reason" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"reviewer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone,
	CONSTRAINT "forum_reports_target" CHECK (num_nonnulls("forum_reports"."post_id", "forum_reports"."comment_id") = 1),
	CONSTRAINT "forum_reports_reason" CHECK (char_length(btrim("forum_reports"."reason")) between 1 and 1000),
	CONSTRAINT "forum_reports_status" CHECK ("forum_reports"."status" in ('open', 'resolved', 'dismissed'))
);
--> statement-breakpoint
CREATE TABLE "forum_write_limits" (
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"bucket_start" timestamp with time zone NOT NULL,
	"count" integer NOT NULL,
	CONSTRAINT "forum_write_limits_user_id_action_bucket_start_pk" PRIMARY KEY("user_id","action","bucket_start")
);
--> statement-breakpoint
ALTER TABLE "forum_comment_votes" ADD CONSTRAINT "forum_comment_votes_comment_id_forum_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."forum_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_comment_votes" ADD CONSTRAINT "forum_comment_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_parent_id_forum_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forum_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_comments" ADD CONSTRAINT "forum_comments_parent_post_fk" FOREIGN KEY ("parent_id","post_id") REFERENCES "public"."forum_comments"("id","post_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_moderation_actions" ADD CONSTRAINT "forum_moderation_actions_moderator_id_user_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_moderation_actions" ADD CONSTRAINT "forum_moderation_actions_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_moderation_actions" ADD CONSTRAINT "forum_moderation_actions_comment_id_forum_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."forum_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_moderation_actions" ADD CONSTRAINT "forum_moderation_actions_report_id_forum_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."forum_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_moderators" ADD CONSTRAINT "forum_moderators_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_post_votes" ADD CONSTRAINT "forum_post_votes_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_post_votes" ADD CONSTRAINT "forum_post_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_comment_id_forum_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."forum_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_write_limits" ADD CONSTRAINT "forum_write_limits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "forum_comment_votes_user_idx" ON "forum_comment_votes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "forum_comments_tree_idx" ON "forum_comments" USING btree ("post_id","parent_id","created_at","id");--> statement-breakpoint
CREATE INDEX "forum_comments_author_idx" ON "forum_comments" USING btree ("author_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "forum_comments_recent_idx" ON "forum_comments" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "forum_comments"."deleted_at" is null and "forum_comments"."hidden_at" is null;--> statement-breakpoint
CREATE INDEX "forum_post_votes_user_idx" ON "forum_post_votes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "forum_posts_new_idx" ON "forum_posts" USING btree ("created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "forum_posts"."deleted_at" is null and "forum_posts"."hidden_at" is null;--> statement-breakpoint
CREATE INDEX "forum_posts_category_idx" ON "forum_posts" USING btree ("category","created_at" DESC NULLS LAST,"id" DESC NULLS LAST) WHERE "forum_posts"."deleted_at" is null and "forum_posts"."hidden_at" is null;--> statement-breakpoint
CREATE INDEX "forum_posts_author_idx" ON "forum_posts" USING btree ("author_id","created_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "forum_posts_search_idx" ON "forum_posts" USING gin (to_tsvector('simple', "title" || ' ' || coalesce("body", '')));--> statement-breakpoint
CREATE UNIQUE INDEX "forum_reports_post_unique" ON "forum_reports" USING btree ("reporter_id","post_id") WHERE "forum_reports"."post_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "forum_reports_comment_unique" ON "forum_reports" USING btree ("reporter_id","comment_id") WHERE "forum_reports"."comment_id" is not null;--> statement-breakpoint
CREATE INDEX "forum_reports_open_idx" ON "forum_reports" USING btree ("created_at","id") WHERE "forum_reports"."status" = 'open';
--> statement-breakpoint
CREATE FUNCTION forum_comment_relationship_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.post_id IS DISTINCT FROM OLD.post_id OR NEW.parent_id IS DISTINCT FROM OLD.parent_id THEN
    RAISE EXCEPTION 'Comment relationships cannot change';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER forum_comment_relationship_immutable BEFORE UPDATE ON forum_comments
FOR EACH ROW EXECUTE FUNCTION forum_comment_relationship_immutable();

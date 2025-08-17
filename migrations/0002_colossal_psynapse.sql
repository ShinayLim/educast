CREATE TYPE "public"."user_role" AS ENUM('student', 'professor');--> statement-breakpoint
CREATE TABLE "podcast_views" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"podcast_id" uuid NOT NULL,
	"user_id" uuid,
	"anon_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"viewer_key" text,
	"view_date" date,
	"user_agent" text
);
--> statement-breakpoint
ALTER TABLE "podcast_views" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "podcasts_comments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"podcast_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"comment" text NOT NULL,
	"likes" integer DEFAULT 0,
	"dislikes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"parent_id" uuid,
	"student_name" text
);
--> statement-breakpoint
CREATE TABLE "podcasts_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"tags" text[],
	"media_url" text NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "podcasts_link" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"email" text,
	CONSTRAINT "profiles_username_key" UNIQUE("username"),
	CONSTRAINT "profiles_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "user_roles_role_check" CHECK (role = ANY (ARRAY['student'::text, 'professor'::text, 'admin'::text]))
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "comments" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "likes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "views" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "comments" CASCADE;--> statement-breakpoint
DROP TABLE "likes" CASCADE;--> statement-breakpoint
DROP TABLE "views" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "playlist_items" DROP CONSTRAINT "playlist_items_playlist_id_playlists_id_fk";
--> statement-breakpoint
ALTER TABLE "playlist_items" DROP CONSTRAINT "playlist_items_podcast_id_podcasts_id_fk";
--> statement-breakpoint
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "podcasts" DROP CONSTRAINT "podcasts_professor_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "playlist_items" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "playlist_items" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "playlist_items" ALTER COLUMN "playlist_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "playlist_items" ALTER COLUMN "podcast_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "user_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "podcasts" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "podcasts" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "podcasts" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "podcasts" ALTER COLUMN "created_at" SET DEFAULT timezone('utc'::text, now());--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE user_role;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "mediaType" text;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "professorId" uuid;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "likes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "dislikes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "podcasts" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "podcast_views" ADD CONSTRAINT "podcast_views_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_views" ADD CONSTRAINT "podcast_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcasts_comments" ADD CONSTRAINT "podcasts_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcasts_link" ADD CONSTRAINT "podcasts_link_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_podcast_view_per_day" ON "podcast_views" USING btree ("podcast_id" date_ops,"viewer_key" date_ops,"view_date" date_ops);--> statement-breakpoint
CREATE INDEX "podcasts_comments_podcast_id_idx" ON "podcasts_comments" USING btree ("podcast_id" uuid_ops);--> statement-breakpoint
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcasts" DROP COLUMN "thumbnail_url";--> statement-breakpoint
ALTER TABLE "podcasts" DROP COLUMN "media_url";--> statement-breakpoint
ALTER TABLE "podcasts" DROP COLUMN "media_type";--> statement-breakpoint
ALTER TABLE "podcasts" DROP COLUMN "duration";--> statement-breakpoint
ALTER TABLE "podcasts" DROP COLUMN "transcript";--> statement-breakpoint
ALTER TABLE "podcasts" DROP COLUMN "professor_id";--> statement-breakpoint
ALTER TABLE "podcasts" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_key" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "podcasts" ADD CONSTRAINT "podcasts_youtube_url_check" CHECK (youtube_url ~ '^https?://(www.)?(youtube.com|youtu.be)/.+$'::text);--> statement-breakpoint
CREATE POLICY "Allow new registering users to insert data" ON "users" AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Allow authenticated to view users" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "anyone_can_insert_view" ON "podcast_views" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Users can insert their own podcasts" ON "podcasts_link" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = uploaded_by));--> statement-breakpoint
CREATE POLICY "Professors can insert" ON "podcasts_link" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Only uploader can update" ON "podcasts_link" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Only uploader can delete" ON "podcasts_link" AS PERMISSIVE FOR DELETE TO "authenticated";--> statement-breakpoint
CREATE POLICY "All authenticated users can read" ON "podcasts_link" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Allow users to select their own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "Allow users to insert their own profile" ON "profiles" AS PERMISSIVE FOR INSERT TO public;
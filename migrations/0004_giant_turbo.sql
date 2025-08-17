ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "Allow new registering users to insert data" ON "users" CASCADE;--> statement-breakpoint
DROP POLICY "Allow authenticated to view users" ON "users" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "podcast_views" DROP CONSTRAINT "podcast_views_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "podcasts_link" DROP CONSTRAINT "podcasts_link_uploaded_by_fkey";
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_id_fkey";
--> statement-breakpoint
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";
--> statement-breakpoint
CREATE POLICY "public can select profiles" ON "profiles" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
ALTER POLICY "Allow users to select their own profile" ON "profiles" TO public USING ((auth.uid() = id));
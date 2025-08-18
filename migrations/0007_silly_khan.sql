ALTER TABLE "podcasts_link" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "Users can insert their own podcasts" ON "podcasts_link" CASCADE;--> statement-breakpoint
DROP POLICY "Professors can insert" ON "podcasts_link" CASCADE;--> statement-breakpoint
DROP POLICY "Only uploader can update" ON "podcasts_link" CASCADE;--> statement-breakpoint
DROP POLICY "Only uploader can delete" ON "podcasts_link" CASCADE;--> statement-breakpoint
DROP POLICY "All authenticated users can read" ON "podcasts_link" CASCADE;--> statement-breakpoint
DROP TABLE "podcasts_link" CASCADE;--> statement-breakpoint
ALTER TABLE "podcast_likes" DROP CONSTRAINT "podcast_likes_podcast_id_podcasts_link_id_fk";
--> statement-breakpoint
ALTER TABLE "podcast_likes" ADD CONSTRAINT "podcast_likes_podcast_id_podcasts_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
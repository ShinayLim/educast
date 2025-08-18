ALTER TABLE "podcast_likes" DROP CONSTRAINT "podcast_likes_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "podcast_likes" DROP CONSTRAINT "podcast_likes_podcast_id_podcasts_id_fk";
--> statement-breakpoint
ALTER TABLE "podcast_likes" ADD CONSTRAINT "podcast_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_likes" ADD CONSTRAINT "podcast_likes_podcast_id_fkey" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts"("id") ON DELETE cascade ON UPDATE no action;
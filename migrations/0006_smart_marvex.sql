CREATE TABLE "podcast_likes" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"podcast_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "podcast_likes_user_podcast" UNIQUE("user_id","podcast_id")
);
--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "podcasts_link" ADD COLUMN "likes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "podcasts_link" ADD COLUMN "dislikes" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "podcast_likes" ADD CONSTRAINT "podcast_likes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcast_likes" ADD CONSTRAINT "podcast_likes_podcast_id_podcasts_link_id_fk" FOREIGN KEY ("podcast_id") REFERENCES "public"."podcasts_link"("id") ON DELETE cascade ON UPDATE no action;
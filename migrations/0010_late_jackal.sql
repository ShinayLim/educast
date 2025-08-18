ALTER TABLE "playlists" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comment_interactions" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "comment_interactions" ADD CONSTRAINT "comment_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_interactions" ADD CONSTRAINT "comment_interactions_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."podcasts_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "podcasts" DROP COLUMN "dislikes";
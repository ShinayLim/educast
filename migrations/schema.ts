import { pgTable, unique, pgPolicy, uuid, text, timestamp, check, uniqueIndex, foreignKey, bigserial, date, index, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const userRole = pgEnum("user_role", ['student', 'professor'])


export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	username: text().notNull(),
	fullName: text("full_name").notNull(),
	role: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	email: text(),
	avatarUrl: text("avatar_url"),
	bio: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("profiles_username_key").on(table.username),
	unique("profiles_email_key").on(table.email),
	pgPolicy("public can select profiles", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("Allow users to select their own profile", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Allow users to insert their own profile", { as: "permissive", for: "insert", to: ["public"] }),
]);

export const podcastsLink = pgTable("podcasts_link", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	tags: text().array(),
	mediaUrl: text("media_url").notNull(),
	uploadedBy: uuid("uploaded_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	pgPolicy("Users can insert their own podcasts", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(auth.uid() = uploaded_by)`  }),
	pgPolicy("Professors can insert", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Only uploader can update", { as: "permissive", for: "update", to: ["authenticated"] }),
	pgPolicy("Only uploader can delete", { as: "permissive", for: "delete", to: ["authenticated"] }),
	pgPolicy("All authenticated users can read", { as: "permissive", for: "select", to: ["authenticated"] }),
]);

export const userRoles = pgTable("user_roles", {
	userId: uuid("user_id").primaryKey().notNull(),
	role: text().notNull(),
}, (table) => [
	check("user_roles_role_check", sql`role = ANY (ARRAY['student'::text, 'professor'::text, 'admin'::text])`),
]);

export const podcastViews = pgTable("podcast_views", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	podcastId: uuid("podcast_id").notNull(),
	userId: uuid("user_id"),
	anonId: text("anon_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	viewerKey: text("viewer_key"),
	viewDate: date("view_date"),
	userAgent: text("user_agent"),
}, (table) => [
	uniqueIndex("uniq_podcast_view_per_day").using("btree", table.podcastId.asc().nullsLast().op("date_ops"), table.viewerKey.asc().nullsLast().op("date_ops"), table.viewDate.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.podcastId],
			foreignColumns: [podcasts.id],
			name: "podcast_views_podcast_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("anyone_can_insert_view", { as: "permissive", for: "insert", to: ["anon", "authenticated"], withCheck: sql`true`  }),
]);

export const podcastsComments = pgTable("podcasts_comments", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	podcastId: uuid("podcast_id").notNull(),
	userId: uuid("user_id").notNull(),
	comment: text().notNull(),
	likes: integer().default(0),
	dislikes: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	parentId: uuid("parent_id"),
	studentName: text("student_name"),
}, (table) => [
	index("podcasts_comments_podcast_id_idx").using("btree", table.podcastId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [profiles.id],
			name: "podcasts_comments_user_id_fkey"
		}).onDelete("cascade"),
]);

export const podcasts = pgTable("podcasts", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	tags: text().array(),
	youtubeUrl: text("youtube_url").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`timezone('utc'::text, now())`),
	mediaType: text(),
	professorId: uuid(),
	likes: integer().default(0),
	dislikes: integer().default(0),
	views: integer().default(0).notNull(),
}, (table) => [
	check("podcasts_youtube_url_check", sql`youtube_url ~ '^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$'::text`),
]);

export const playlists = pgTable("playlists", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	userId: uuid("user_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const playlistItems = pgTable("playlist_items", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	playlistId: uuid("playlist_id").notNull(),
	podcastId: uuid("podcast_id").notNull(),
	order: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.playlistId],
			foreignColumns: [playlists.id],
			name: "playlist_items_playlist_id_playlists_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.podcastId],
			foreignColumns: [podcasts.id],
			name: "playlist_items_podcast_id_podcasts_id_fk"
		}).onDelete("cascade"),
]);

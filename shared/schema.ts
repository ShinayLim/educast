// shared\schema.ts

import {
  pgTable,
  unique,
  pgPolicy,
  uuid,
  text,
  timestamp,
  foreignKey,
  check,
  uniqueIndex,
  bigserial,
  date,
  index,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { z } from "zod";

export const userRole = pgEnum("user_role", ["student", "professor"]);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().notNull(),
    username: text().notNull(),
    full_name: text("full_name").notNull(),
    role: text().notNull(),
    status: text().default("pending"),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    email: text(),
    avatar_url: text("avatar_url"),
    bio: text(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    unique("profiles_username_key").on(table.username),
    unique("profiles_email_key").on(table.email),
    pgPolicy("public can select profiles", {
      as: "permissive",
      for: "select",
      to: ["public"],
      using: sql`true`,
    }),
    pgPolicy("Allow users to select their own profile", {
      as: "permissive",
      for: "select",
      to: ["public"],
    }),
    pgPolicy("Allow users to insert their own profile", {
      as: "permissive",
      for: "insert",
      to: ["public"],
    }),
  ]
);

// export const podcastsLink = pgTable(
//   "podcasts_link",
//   {
//     id: uuid().defaultRandom().primaryKey().notNull(),
//     title: text().notNull(),
//     description: text().notNull(),
//     tags: text().array(),
//     media_url: text("media_url").notNull(),
//     uploaded_by: uuid("uploaded_by").notNull(),
//     created_at: timestamp("created_at", {
//       withTimezone: true,
//       mode: "string",
//     }).defaultNow(),
//     updated_at: timestamp("updated_at", {
//       withTimezone: true,
//       mode: "string",
//     }).defaultNow(),
//   },
//   (table) => [
//     pgPolicy("Users can insert their own podcasts", {
//       as: "permissive",
//       for: "insert",
//       to: ["public"],
//       withCheck: sql`(auth.uid() = uploaded_by)`,
//     }),
//     pgPolicy("Professors can insert", {
//       as: "permissive",
//       for: "insert",
//       to: ["public"],
//     }),
//     pgPolicy("Only uploader can update", {
//       as: "permissive",
//       for: "update",
//       to: ["authenticated"],
//     }),
//     pgPolicy("Only uploader can delete", {
//       as: "permissive",
//       for: "delete",
//       to: ["authenticated"],
//     }),
//     pgPolicy("All authenticated users can read", {
//       as: "permissive",
//       for: "select",
//       to: ["authenticated"],
//     }),
//   ]
// );

export const userRoles = pgTable(
  "user_roles",
  {
    user_id: uuid("user_id").primaryKey().notNull(),
    role: text().notNull(),
  },
  (table) => [
    check(
      "user_roles_role_check",
      sql`role = ANY (ARRAY['student'::text, 'professor'::text, 'admin'::text])`
    ),
  ]
);

export const podcastViews = pgTable(
  "podcast_views",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    podcast_id: uuid("podcast_id").notNull(),
    user_id: uuid("user_id"),
    anon_id: text("anon_id"),
    created_at: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    viewer_key: text("viewer_key"),
    view_date: date("view_date"),
    user_agent: text("user_agent"),
  },
  (table) => [
    uniqueIndex("uniq_podcast_view_per_day").using(
      "btree",
      table.podcast_id.asc().nullsLast().op("date_ops"),
      table.viewer_key.asc().nullsLast().op("date_ops"),
      table.view_date.asc().nullsLast().op("date_ops")
    ),
    foreignKey({
      columns: [table.podcast_id],
      foreignColumns: [podcasts.id],
      name: "podcast_views_podcast_id_fkey",
    }).onDelete("cascade"),
    pgPolicy("anyone_can_insert_view", {
      as: "permissive",
      for: "insert",
      to: ["anon", "authenticated"],
      withCheck: sql`true`,
    }),
  ]
);

export const podcastLikes = pgTable(
  "podcast_likes",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    user_id: uuid("user_id").notNull(),
    podcast_id: uuid("podcast_id").notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    unique("podcast_likes_user_podcast").on(table.user_id, table.podcast_id),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [profiles.id],
      name: "podcast_likes_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.podcast_id],
      foreignColumns: [podcasts.id],
      name: "podcast_likes_podcast_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const podcastsComments = pgTable(
  "podcasts_comments",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    podcast_id: uuid("podcast_id").notNull(),
    user_id: uuid("user_id").notNull(),
    comment: text().notNull(),
    likes: integer().default(0),
    dislikes: integer().default(0),
    created_at: timestamp("created_at", { mode: "string" }).defaultNow(),
    updated_at: timestamp("updated_at", { mode: "string" }).defaultNow(),
    parent_id: uuid("parent_id"),
    student_name: text("student_name"),
  },
  (table) => [
    index("podcasts_comments_podcast_id_idx").using(
      "btree",
      table.podcast_id.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [profiles.id],
      name: "podcasts_comments_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const commentInteractions = pgTable(
  "comment_interactions",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    user_id: uuid("user_id").notNull(),
    comment_id: uuid("comment_id").notNull(),
    interaction_type: text("interaction_type").notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updated_at: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
  },
  (table) => [
    unique("comment_interaction_user_comment").on(
      table.user_id,
      table.comment_id
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [profiles.id],
      name: "comment_interactions_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.comment_id],
      foreignColumns: [podcastsComments.id],
      name: "comment_interactions_comment_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const podcasts = pgTable(
  "podcasts",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    title: text().notNull(),
    description: text().notNull(),
    tags: text().array(),
    youtube_url: text("youtube_url").notNull(),
    created_at: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`timezone('utc'::text, now())`),
    media_type: text(),
    professor_id: uuid(),
    likes: integer().default(0),
    views: integer().default(0).notNull(),
  },
  (table) => [
    check(
      "podcasts_youtube_url_check",
      sql`youtube_url ~ '^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$'::text`
    ),
  ]
);

export const playlists = pgTable("playlists", {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  title: text().notNull(),
  description: text(),
  user_id: uuid("user_id").notNull(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
  updated_at: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).defaultNow(),
});

export const playlistItems = pgTable(
  "playlist_items",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    playlist_id: uuid("playlist_id").notNull(),
    podcast_id: uuid("podcast_id").notNull(),
    order: integer().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.playlist_id],
      foreignColumns: [playlists.id],
      name: "playlist_items_playlist_id_playlists_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.podcast_id],
      foreignColumns: [podcasts.id],
      name: "playlist_items_podcast_id_podcasts_id_fk",
    }).onDelete("cascade"),
  ]
);

//
// INSERT SCHEMAS
//

export const insertUserSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
// export const insertPodcastLinkSchema = createInsertSchema(podcastsLink).omit({
//   id: true,
//   created_at: true,
//   updated_at: true,
// });
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({});
export const insertPodcastViewSchema = createInsertSchema(podcastViews).omit({
  id: true,
  created_at: true,
});
export const insertPodcastLikeSchema = createInsertSchema(podcastLikes).omit({
  id: true,
  created_at: true,
});
export const insertPodcastCommentSchema = createInsertSchema(
  podcastsComments
).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const insertPodcastSchema = createInsertSchema(podcasts).omit({
  id: true,
  created_at: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export const insertPlaylistItemSchema = createInsertSchema(playlistItems).omit({
  id: true,
});

//
// TYPES
//

export type User = typeof profiles.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Podcast = typeof podcasts.$inferSelect;
export type InsertPodcast = z.infer<typeof insertPodcastSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type PlaylistItem = typeof playlistItems.$inferSelect;
export type InsertPlaylistItem = z.infer<typeof insertPlaylistItemSchema>;

// export type PodcastLink = typeof podcastsLink.$inferSelect;
// export type InsertPodcastLink = z.infer<typeof insertPodcastLinkSchema>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

export type PodcastView = typeof podcastViews.$inferSelect;
export type InsertPodcastView = z.infer<typeof insertPodcastViewSchema>;

export type PodcastLike = typeof podcastLikes.$inferSelect;
export type InsertPodcastLike = z.infer<typeof insertPodcastLikeSchema>;

export type PodcastComment = typeof podcastsComments.$inferSelect;
export type InsertPodcastComment = z.infer<typeof insertPodcastCommentSchema>;

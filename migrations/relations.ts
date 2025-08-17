import { relations } from "drizzle-orm/relations";
import { podcasts, podcastViews, profiles, podcastsComments, playlists, playlistItems } from "./schema";

export const podcastViewsRelations = relations(podcastViews, ({one}) => ({
	podcast: one(podcasts, {
		fields: [podcastViews.podcastId],
		references: [podcasts.id]
	}),
}));

export const podcastsRelations = relations(podcasts, ({many}) => ({
	podcastViews: many(podcastViews),
	playlistItems: many(playlistItems),
}));

export const podcastsCommentsRelations = relations(podcastsComments, ({one}) => ({
	profile: one(profiles, {
		fields: [podcastsComments.userId],
		references: [profiles.id]
	}),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	podcastsComments: many(podcastsComments),
}));

export const playlistItemsRelations = relations(playlistItems, ({one}) => ({
	playlist: one(playlists, {
		fields: [playlistItems.playlistId],
		references: [playlists.id]
	}),
	podcast: one(podcasts, {
		fields: [playlistItems.podcastId],
		references: [podcasts.id]
	}),
}));

export const playlistsRelations = relations(playlists, ({many}) => ({
	playlistItems: many(playlistItems),
}));
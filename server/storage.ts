// server/storage.ts
import * as dotenv from "dotenv";
dotenv.config(); // ← load .env into process.env
import session from "express-session";
import MemStoreFactory from "memorystore";
import { createClient } from "@supabase/supabase-js";

import {
  type User,
  type InsertUser,
  type Podcast,
  type InsertPodcast,
  type Playlist,
  type InsertPlaylist,
  type PlaylistItem,
  type InsertPlaylistItem,
  type podcastsComments,
  type insertPodcastCommentSchema,
  type podcastLikes,
  type insertPodcastLikeSchema,
  type podcastViews,
  type insertPodcastViewSchema,
  InsertPodcastComment,
  InsertPodcastLike,
  PodcastLike,
  InsertPodcastView,
  PodcastView,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  createPodcast(podcast: InsertPodcast): Promise<Podcast>;
  getPodcast(id: number): Promise<Podcast | undefined>;
  getPodcastsByProfessorId(professorId: number): Promise<Podcast[]>;
  getAllPodcasts(): Promise<Podcast[]>;
  searchPodcasts(query: string): Promise<Podcast[]>;
  updatePodcast(
    id: number,
    podcast: Partial<Podcast>
  ): Promise<Podcast | undefined>;
  deletePodcast(id: number): Promise<boolean>;

  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylistsByUserId(userId: number): Promise<Playlist[]>;
  updatePlaylist(
    id: number,
    playlist: Partial<Playlist>
  ): Promise<Playlist | undefined>;
  deletePlaylist(id: number): Promise<boolean>;

  addPodcastToPlaylist(item: InsertPlaylistItem): Promise<PlaylistItem>;
  getPlaylistItems(playlistId: number): Promise<PlaylistItem[]>;
  removePlaylistItem(id: number): Promise<boolean>;

  createComment(comment: InsertPodcastComment): Promise<Comment>;
  getCommentsByPodcastId(podcastId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<boolean>;

  createLike(like: InsertPodcastLike): Promise<PodcastLike>;
  getLikesByPodcastId(podcastId: number): Promise<PodcastLike[]>;
  getLikeByUserAndPodcast(
    userId: number,
    podcastId: number
  ): Promise<PodcastLike | undefined>;
  deleteLike(id: number): Promise<boolean>;

  createView(view: InsertPodcastView): Promise<PodcastView>;
  getViewsByPodcastId(podcastId: number): Promise<PodcastView[]>;

  sessionStore: session.Store;
}

// Create a memory‐backed session store:
const MemoryStore = MemStoreFactory(session);

// Read in Vite’s injected vars:
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in your environment");
}

// Instantiate Supabase client once:
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  // — User —
  async getUser(id: number) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data ?? undefined;
  }

  async getUserByUsername(username: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();
    if (error) throw error;
    return data ?? undefined;
  }

  async createUser(u: InsertUser) {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username: u.username,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          avatar_url: u.avatar_url ?? null,
          bio: u.bio ?? null,
        },
      ])
      .select("*")
      .single();
    if (error) throw error;
    return data!;
  }

  async updateUser(id: number, u: Partial<User>) {
    const p: Record<string, any> = {};
    if (u.username !== undefined) p.username = u.username;
    if (u.email !== undefined) p.email = u.email;
    if (u.full_name !== undefined) p.full_name = u.full_name;
    if (u.role !== undefined) p.role = u.role;
    if (u.avatar_url !== undefined) p.avatar_url = u.avatar_url;
    if (u.bio !== undefined) p.bio = u.bio;

    const { data, error } = await supabase
      .from("users")
      .update(p)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data ?? undefined;
  }

  // — Podcast —
  async createPodcast(c: InsertPodcast) {
    const { data, error } = await supabase
      .from("podcasts")
      .insert([
        {
          title: c.title,
          description: c.description ?? null,
          media_url: c.youtube_url,
          media_type: c.media_type,
          professor_id: c.professor_id,
          tags: c.tags ?? null,
        },
      ])
      .select("*")
      .single();
    if (error) throw error;
    return data!;
  }

  async getPodcast(id: number) {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data ?? undefined;
  }

  async getPodcastsByProfessorId(professorId: number) {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("professor_id", professorId);
    if (error) throw error;
    return data ?? [];
  }

  async getAllPodcasts() {
    const { data, error } = await supabase.from("podcasts").select("*");
    if (error) throw error;
    return data ?? [];
  }

  async searchPodcasts(q: string) {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`);
    if (error) throw error;
    return data ?? [];
  }

  async updatePodcast(id: number, c: Partial<Podcast>) {
    const p: Record<string, any> = {};
    if (c.title !== undefined) p.title = c.title;
    if (c.description !== undefined) p.description = c.description;
    if (c.youtube_url !== undefined) p.media_url = c.youtube_url;
    if (c.media_type !== undefined) p.media_type = c.media_type;
    if (c.professor_id !== undefined) p.professor_id = c.professor_id;
    if (c.tags !== undefined) p.tags = c.tags;

    const { data, error } = await supabase
      .from("podcasts")
      .update(p)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data ?? undefined;
  }

  async deletePodcast(id: number) {
    const { error } = await supabase.from("podcasts").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // — Playlist —
  async createPlaylist(p: InsertPlaylist) {
    const { data, error } = await supabase
      .from("playlists")
      .insert([
        {
          title: p.title,
          description: p.description ?? null,
          user_id: p.user_id,
        },
      ])
      .select("*")
      .single();
    if (error) throw error;
    return data!;
  }

  async getPlaylist(id: number) {
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data ?? undefined;
  }

  async getPlaylistsByUserId(userId: number) {
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data ?? [];
  }

  async updatePlaylist(id: number, p: Partial<Playlist>) {
    const o: Record<string, any> = {};
    if (p.title !== undefined) o.title = p.title;
    if (p.description !== undefined) o.description = p.description;
    if (p.user_id !== undefined) o.user_id = p.user_id;

    const { data, error } = await supabase
      .from("playlists")
      .update(o)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data ?? undefined;
  }

  async deletePlaylist(id: number) {
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // — Playlist Items —
  async addPodcastToPlaylist(i: InsertPlaylistItem) {
    const { data, error } = await supabase
      .from("playlist_items")
      .insert([
        {
          playlist_id: i.playlist_id,
          podcast_id: i.podcast_id,
          order: i.order,
        },
      ])
      .select("*")
      .single();
    if (error) throw error;
    return data!;
  }

  async getPlaylistItems(playlistId: number) {
    const { data, error } = await supabase
      .from("playlist_items")
      .select("*")
      .eq("playlist_id", playlistId)
      .order("order", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async removePlaylistItem(id: number) {
    const { error } = await supabase
      .from("playlist_items")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }

  // — Comments —
  async createComment(c: InsertPodcastComment) {
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          podcast_id: c.podcast_id,
          user_id: c.user_id,
          content: c.comment,
        },
      ])
      .select("*")
      .single();
    if (error) throw error;
    return data!;
  }

  async getCommentsByPodcastId(podcastId: number) {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("podcast_id", podcastId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async deleteComment(id: number) {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // — Likes —
  async createLike(l: InsertPodcastLike) {
    const { data, error } = await supabase
      .from("likes")
      .insert([
        {
          user_id: l.user_id,
          podcast_id: l.podcast_id,
        },
      ])
      .select("*")
      .single();
    if (error) throw error;
    return data!;
  }

  async getLikesByPodcastId(podcastId: number) {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .eq("podcast_id", podcastId);
    if (error) throw error;
    return data ?? [];
  }

  async getLikeByUserAndPodcast(userId: number, podcastId: number) {
    const { data, error } = await supabase
      .from("likes")
      .select("*")
      .eq("user_id", userId)
      .eq("podcast_id", podcastId)
      .single();
    if (error) throw error;
    return data ?? undefined;
  }

  async deleteLike(id: number) {
    const { error } = await supabase.from("likes").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  // — Views —
  async createView(v: InsertPodcastView) {
    const { data, error } = await supabase
      .from("views")
      .insert([
        {
          user_id: v.user_id,
          podcast_id: v.podcast_id,
        },
      ])
      .select("*")
      .single();
    if (error) throw error;
    return data!;
  }

  async getViewsByPodcastId(podcastId: number) {
    const { data, error } = await supabase
      .from("views")
      .select("*")
      .eq("podcast_id", podcastId);
    if (error) throw error;
    return data ?? [];
  }
}

export const storage = new SupabaseStorage();

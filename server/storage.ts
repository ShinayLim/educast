// server/storage.ts
import * as dotenv from "dotenv";
dotenv.config();  // ← load .env into process.env
import session from "express-session";
import MemStoreFactory from "memorystore";
import { createClient } from "@supabase/supabase-js";

import {
  type User,       type InsertUser,
  type Podcast,    type InsertPodcast,
  type Playlist,   type InsertPlaylist,
  type PlaylistItem, type InsertPlaylistItem,
  type Comment,    type InsertComment,
  type Like,       type InsertLike,
  type View,       type InsertView,
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
  updatePodcast(id: number, podcast: Partial<Podcast>): Promise<Podcast | undefined>;
  deletePodcast(id: number): Promise<boolean>;

  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylistsByUserId(userId: number): Promise<Playlist[]>;
  updatePlaylist(id: number, playlist: Partial<Playlist>): Promise<Playlist | undefined>;
  deletePlaylist(id: number): Promise<boolean>;

  addPodcastToPlaylist(item: InsertPlaylistItem): Promise<PlaylistItem>;
  getPlaylistItems(playlistId: number): Promise<PlaylistItem[]>;
  removePlaylistItem(id: number): Promise<boolean>;

  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPodcastId(podcastId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<boolean>;

  createLike(like: InsertLike): Promise<Like>;
  getLikesByPodcastId(podcastId: number): Promise<Like[]>;
  getLikeByUserAndPodcast(userId: number, podcastId: number): Promise<Like | undefined>;
  deleteLike(id: number): Promise<boolean>;

  createView(view: InsertView): Promise<View>;
  getViewsByPodcastId(podcastId: number): Promise<View[]>;

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
      .insert([{
        username:   u.username,
        email:      u.email,
        full_name:  u.fullName,
        password:   u.password,
        role:       u.role,
        avatar_url: u.avatarUrl ?? null,
        bio:        u.bio ?? null,
      }])
      .select("*")
      .single();
    if (error) throw error;
    return data!;
  }

  async updateUser(id: number, u: Partial<User>) {
    const p: Record<string, any> = {};
    if (u.username  !== undefined) p.username   = u.username;
    if (u.email     !== undefined) p.email      = u.email;
    if (u.fullName  !== undefined) p.full_name  = u.fullName;
    if (u.password  !== undefined) p.password   = u.password;
    if (u.role      !== undefined) p.role       = u.role;
    if (u.avatarUrl !== undefined) p.avatar_url = u.avatarUrl;
    if (u.bio       !== undefined) p.bio        = u.bio;

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
      .insert([{
        title:         c.title,
        description:   c.description ?? null,
        media_url:     c.mediaUrl,
        media_type:    c.mediaType,
        professor_id:  c.professorId,
        thumbnail_url: c.thumbnailUrl ?? null,
        duration:      c.duration ?? null,
        transcript:    c.transcript ?? null,
        tags:          c.tags ?? null,
      }])
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
    const { data, error } = await supabase
      .from("podcasts")
      .select("*");
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
    if (c.title        !== undefined) p.title         = c.title;
    if (c.description  !== undefined) p.description   = c.description;
    if (c.mediaUrl     !== undefined) p.media_url     = c.mediaUrl;
    if (c.mediaType    !== undefined) p.media_type    = c.mediaType;
    if (c.professorId  !== undefined) p.professor_id  = c.professorId;
    if (c.thumbnailUrl !== undefined) p.thumbnail_url = c.thumbnailUrl;
    if (c.duration     !== undefined) p.duration      = c.duration;
    if (c.transcript   !== undefined) p.transcript    = c.transcript;
    if (c.tags         !== undefined) p.tags          = c.tags;

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
    const { error } = await supabase
      .from("podcasts")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }

  // — Playlist —
  async createPlaylist(p: InsertPlaylist) {
    const { data, error } = await supabase
      .from("playlists")
      .insert([{
        title:       p.title,
        description: p.description ?? null,
        user_id:     p.userId,
      }])
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
    if (p.title       !== undefined) o.title       = p.title;
    if (p.description !== undefined) o.description = p.description;
    if (p.userId      !== undefined) o.user_id     = p.userId;

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
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }

  // — Playlist Items —
  async addPodcastToPlaylist(i: InsertPlaylistItem) {
    const { data, error } = await supabase
      .from("playlist_items")
      .insert([{
        playlist_id: i.playlistId,
        podcast_id:  i.podcastId,
        order:       i.order,
      }])
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
  async createComment(c: InsertComment) {
    const { data, error } = await supabase
      .from("comments")
      .insert([{
        podcast_id: c.podcastId,
        user_id:    c.userId,
        content:    c.content,
      }])
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
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }

  // — Likes —
  async createLike(l: InsertLike) {
    const { data, error } = await supabase
      .from("likes")
      .insert([{
        user_id:    l.userId,
        podcast_id: l.podcastId,
      }])
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
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }

  // — Views —
  async createView(v: InsertView) {
    const { data, error } = await supabase
      .from("views")
      .insert([{
        user_id:    v.userId,
        podcast_id: v.podcastId,
      }])
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

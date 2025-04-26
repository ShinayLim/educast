import { 
  users, type User, type InsertUser,
  podcasts, type Podcast, type InsertPodcast,
  playlists, type Playlist, type InsertPlaylist,
  playlistItems, type PlaylistItem, type InsertPlaylistItem,
  comments, type Comment, type InsertComment,
  likes, type Like, type InsertLike,
  views, type View, type InsertView
} from "@shared/schema";
import { IStorage } from "./storage";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Podcast methods
  async createPodcast(podcast: InsertPodcast): Promise<Podcast> {
    const [newPodcast] = await db.insert(podcasts).values(podcast).returning();
    return newPodcast;
  }

  async getPodcast(id: number): Promise<Podcast | undefined> {
    const [podcast] = await db.select().from(podcasts).where(eq(podcasts.id, id));
    return podcast;
  }

  async getPodcastsByProfessorId(professorId: number): Promise<Podcast[]> {
    return await db.select().from(podcasts).where(eq(podcasts.professorId, professorId));
  }

  async getAllPodcasts(): Promise<Podcast[]> {
    return await db.select().from(podcasts);
  }

  async searchPodcasts(query: string): Promise<Podcast[]> {
    const lowerQuery = query.toLowerCase();
    // Basic search implementation - in a real app would use full-text search
    const results = await db.select().from(podcasts);
    return results.filter(podcast => 
      podcast.title.toLowerCase().includes(lowerQuery) || 
      podcast.description.toLowerCase().includes(lowerQuery) ||
      (podcast.tags && podcast.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  async updatePodcast(id: number, podcastData: Partial<Podcast>): Promise<Podcast | undefined> {
    const [updatedPodcast] = await db.update(podcasts)
      .set(podcastData)
      .where(eq(podcasts.id, id))
      .returning();
    return updatedPodcast;
  }

  async deletePodcast(id: number): Promise<boolean> {
    await db.delete(podcasts).where(eq(podcasts.id, id));
    return true;
  }

  // Playlist methods
  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const [newPlaylist] = await db.insert(playlists).values(playlist).returning();
    return newPlaylist;
  }

  async getPlaylist(id: number): Promise<Playlist | undefined> {
    const [playlist] = await db.select().from(playlists).where(eq(playlists.id, id));
    return playlist;
  }

  async getPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    return await db.select().from(playlists).where(eq(playlists.userId, userId));
  }

  async updatePlaylist(id: number, playlistData: Partial<Playlist>): Promise<Playlist | undefined> {
    const [updatedPlaylist] = await db.update(playlists)
      .set(playlistData)
      .where(eq(playlists.id, id))
      .returning();
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<boolean> {
    await db.delete(playlists).where(eq(playlists.id, id));
    return true;
  }

  // Playlist item methods
  async addPodcastToPlaylist(playlistItem: InsertPlaylistItem): Promise<PlaylistItem> {
    const [newItem] = await db.insert(playlistItems).values(playlistItem).returning();
    return newItem;
  }

  async getPlaylistItems(playlistId: number): Promise<PlaylistItem[]> {
    return await db.select()
      .from(playlistItems)
      .where(eq(playlistItems.playlistId, playlistId))
      .orderBy(playlistItems.order);
  }

  async removePlaylistItem(id: number): Promise<boolean> {
    await db.delete(playlistItems).where(eq(playlistItems.id, id));
    return true;
  }

  // Comment methods
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getCommentsByPodcastId(podcastId: number): Promise<Comment[]> {
    return await db.select()
      .from(comments)
      .where(eq(comments.podcastId, podcastId))
      .orderBy(desc(comments.createdAt));
  }

  async deleteComment(id: number): Promise<boolean> {
    await db.delete(comments).where(eq(comments.id, id));
    return true;
  }

  // Like methods
  async createLike(like: InsertLike): Promise<Like> {
    const [newLike] = await db.insert(likes).values(like).returning();
    return newLike;
  }

  async getLikesByPodcastId(podcastId: number): Promise<Like[]> {
    return await db.select().from(likes).where(eq(likes.podcastId, podcastId));
  }

  async getLikeByUserAndPodcast(userId: number, podcastId: number): Promise<Like | undefined> {
    const [like] = await db.select()
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(likes.podcastId, podcastId)
        )
      );
    return like;
  }

  async deleteLike(id: number): Promise<boolean> {
    await db.delete(likes).where(eq(likes.id, id));
    return true;
  }

  // View methods
  async createView(view: InsertView): Promise<View> {
    const [newView] = await db.insert(views).values(view).returning();
    return newView;
  }

  async getViewsByPodcastId(podcastId: number): Promise<View[]> {
    return await db.select().from(views).where(eq(views.podcastId, podcastId));
  }
}
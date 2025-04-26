import { 
  users, type User, type InsertUser,
  podcasts, type Podcast, type InsertPodcast,
  playlists, type Playlist, type InsertPlaylist,
  playlistItems, type PlaylistItem, type InsertPlaylistItem,
  comments, type Comment, type InsertComment,
  likes, type Like, type InsertLike,
  views, type View, type InsertView
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Use any to avoid type errors with session store
type SessionStore = any;
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Podcast methods
  createPodcast(podcast: InsertPodcast): Promise<Podcast>;
  getPodcast(id: number): Promise<Podcast | undefined>;
  getPodcastsByProfessorId(professorId: number): Promise<Podcast[]>;
  getAllPodcasts(): Promise<Podcast[]>;
  searchPodcasts(query: string): Promise<Podcast[]>;
  updatePodcast(id: number, podcast: Partial<Podcast>): Promise<Podcast | undefined>;
  deletePodcast(id: number): Promise<boolean>;
  
  // Playlist methods
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  getPlaylist(id: number): Promise<Playlist | undefined>;
  getPlaylistsByUserId(userId: number): Promise<Playlist[]>;
  updatePlaylist(id: number, playlist: Partial<Playlist>): Promise<Playlist | undefined>;
  deletePlaylist(id: number): Promise<boolean>;
  
  // Playlist item methods
  addPodcastToPlaylist(playlistItem: InsertPlaylistItem): Promise<PlaylistItem>;
  getPlaylistItems(playlistId: number): Promise<PlaylistItem[]>;
  removePlaylistItem(id: number): Promise<boolean>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPodcastId(podcastId: number): Promise<Comment[]>;
  deleteComment(id: number): Promise<boolean>;
  
  // Like methods
  createLike(like: InsertLike): Promise<Like>;
  getLikesByPodcastId(podcastId: number): Promise<Like[]>;
  getLikeByUserAndPodcast(userId: number, podcastId: number): Promise<Like | undefined>;
  deleteLike(id: number): Promise<boolean>;
  
  // View methods
  createView(view: InsertView): Promise<View>;
  getViewsByPodcastId(podcastId: number): Promise<View[]>;
  
  // Session store
  sessionStore: any; // Using any to avoid type issues with different session stores
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private podcastsMap: Map<number, Podcast>;
  private playlistsMap: Map<number, Playlist>;
  private playlistItemsMap: Map<number, PlaylistItem>;
  private commentsMap: Map<number, Comment>;
  private likesMap: Map<number, Like>;
  private viewsMap: Map<number, View>;
  
  private userId: number;
  private podcastId: number;
  private playlistId: number;
  private playlistItemId: number;
  private commentId: number;
  private likeId: number;
  private viewId: number;
  
  sessionStore: any; // Using any to avoid type issues with different session stores

  constructor() {
    this.usersMap = new Map();
    this.podcastsMap = new Map();
    this.playlistsMap = new Map();
    this.playlistItemsMap = new Map();
    this.commentsMap = new Map();
    this.likesMap = new Map();
    this.viewsMap = new Map();
    
    this.userId = 1;
    this.podcastId = 1;
    this.playlistId = 1;
    this.playlistItemId = 1;
    this.commentId = 1;
    this.likeId = 1;
    this.viewId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    
    // Set default values to meet the schema requirements
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      role: insertUser.role || 'student', // Default role if not provided
      avatarUrl: insertUser.avatarUrl || null,
      bio: insertUser.bio || null
    };
    
    this.usersMap.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersMap.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }
  
  // Podcast methods
  async createPodcast(insertPodcast: InsertPodcast): Promise<Podcast> {
    const id = this.podcastId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const podcast: Podcast = { ...insertPodcast, id, createdAt, updatedAt };
    this.podcastsMap.set(id, podcast);
    return podcast;
  }
  
  async getPodcast(id: number): Promise<Podcast | undefined> {
    return this.podcastsMap.get(id);
  }
  
  async getPodcastsByProfessorId(professorId: number): Promise<Podcast[]> {
    return Array.from(this.podcastsMap.values()).filter(
      (podcast) => podcast.professorId === professorId
    );
  }
  
  async getAllPodcasts(): Promise<Podcast[]> {
    return Array.from(this.podcastsMap.values());
  }
  
  async searchPodcasts(query: string): Promise<Podcast[]> {
    const lowerCaseQuery = query.toLowerCase();
    return Array.from(this.podcastsMap.values()).filter(
      (podcast) => 
        podcast.title.toLowerCase().includes(lowerCaseQuery) || 
        podcast.description.toLowerCase().includes(lowerCaseQuery) ||
        (podcast.tags && podcast.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
    );
  }
  
  async updatePodcast(id: number, podcastData: Partial<Podcast>): Promise<Podcast | undefined> {
    const podcast = this.podcastsMap.get(id);
    if (!podcast) return undefined;
    
    const updatedPodcast = { 
      ...podcast, 
      ...podcastData, 
      updatedAt: new Date() 
    };
    this.podcastsMap.set(id, updatedPodcast);
    return updatedPodcast;
  }
  
  async deletePodcast(id: number): Promise<boolean> {
    return this.podcastsMap.delete(id);
  }
  
  // Playlist methods
  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.playlistId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const playlist: Playlist = { ...insertPlaylist, id, createdAt, updatedAt };
    this.playlistsMap.set(id, playlist);
    return playlist;
  }
  
  async getPlaylist(id: number): Promise<Playlist | undefined> {
    return this.playlistsMap.get(id);
  }
  
  async getPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlistsMap.values()).filter(
      (playlist) => playlist.userId === userId
    );
  }
  
  async updatePlaylist(id: number, playlistData: Partial<Playlist>): Promise<Playlist | undefined> {
    const playlist = this.playlistsMap.get(id);
    if (!playlist) return undefined;
    
    const updatedPlaylist = { 
      ...playlist, 
      ...playlistData, 
      updatedAt: new Date() 
    };
    this.playlistsMap.set(id, updatedPlaylist);
    return updatedPlaylist;
  }
  
  async deletePlaylist(id: number): Promise<boolean> {
    return this.playlistsMap.delete(id);
  }
  
  // Playlist item methods
  async addPodcastToPlaylist(insertPlaylistItem: InsertPlaylistItem): Promise<PlaylistItem> {
    const id = this.playlistItemId++;
    const playlistItem: PlaylistItem = { ...insertPlaylistItem, id };
    this.playlistItemsMap.set(id, playlistItem);
    return playlistItem;
  }
  
  async getPlaylistItems(playlistId: number): Promise<PlaylistItem[]> {
    return Array.from(this.playlistItemsMap.values())
      .filter(item => item.playlistId === playlistId)
      .sort((a, b) => a.order - b.order);
  }
  
  async removePlaylistItem(id: number): Promise<boolean> {
    return this.playlistItemsMap.delete(id);
  }
  
  // Comment methods
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const createdAt = new Date();
    const comment: Comment = { ...insertComment, id, createdAt };
    this.commentsMap.set(id, comment);
    return comment;
  }
  
  async getCommentsByPodcastId(podcastId: number): Promise<Comment[]> {
    return Array.from(this.commentsMap.values())
      .filter(comment => comment.podcastId === podcastId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async deleteComment(id: number): Promise<boolean> {
    return this.commentsMap.delete(id);
  }
  
  // Like methods
  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = this.likeId++;
    const createdAt = new Date();
    const like: Like = { ...insertLike, id, createdAt };
    this.likesMap.set(id, like);
    return like;
  }
  
  async getLikesByPodcastId(podcastId: number): Promise<Like[]> {
    return Array.from(this.likesMap.values())
      .filter(like => like.podcastId === podcastId);
  }
  
  async getLikeByUserAndPodcast(userId: number, podcastId: number): Promise<Like | undefined> {
    return Array.from(this.likesMap.values()).find(
      like => like.userId === userId && like.podcastId === podcastId
    );
  }
  
  async deleteLike(id: number): Promise<boolean> {
    return this.likesMap.delete(id);
  }
  
  // View methods
  async createView(insertView: InsertView): Promise<View> {
    const id = this.viewId++;
    const createdAt = new Date();
    const view: View = { ...insertView, id, createdAt };
    this.viewsMap.set(id, view);
    return view;
  }
  
  async getViewsByPodcastId(podcastId: number): Promise<View[]> {
    return Array.from(this.viewsMap.values())
      .filter(view => view.podcastId === podcastId);
  }
}

export const storage = new MemStorage();

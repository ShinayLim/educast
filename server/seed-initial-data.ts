import { storage } from "./storage";

/**
 * Seeds initial data for the in-memory storage
 * This function creates test users, podcasts, and other data
 * for development and testing purposes
 */
export async function seedInitialData() {
  console.log("Seeding initial data for in-memory storage...");
  
  // Create test users
  const professor1 = await storage.createUser({
    username: "professor1",
    password: "password123", // In a real app, this would be hashed
    email: "professor1@example.com",
    fullName: "Professor Smith",
    role: "professor",
    bio: "Computer Science professor specializing in AI and Machine Learning",
    avatarUrl: null
  });
  
  const professor2 = await storage.createUser({
    username: "professor2",
    password: "password123",
    email: "professor2@example.com",
    fullName: "Professor Johnson",
    role: "professor",
    bio: "History professor with focus on Modern European History",
    avatarUrl: null
  });
  
  const student1 = await storage.createUser({
    username: "student1",
    password: "password123",
    email: "student1@example.com",
    fullName: "Alex Student",
    role: "student",
    bio: "Computer Science major, Year 3",
    avatarUrl: null
  });
  
  const student2 = await storage.createUser({
    username: "student2",
    password: "password123",
    email: "student2@example.com",
    fullName: "Jamie Student",
    role: "student",
    bio: "History major, Year 2",
    avatarUrl: null
  });
  
  // Create test podcasts
  const podcast1 = await storage.createPodcast({
    title: "Introduction to Machine Learning",
    description: "Learn the fundamentals of machine learning algorithms and their applications.",
    mediaUrl: "/uploads/audios/sample-audio-1.mp3", // This file doesn't exist, for demo only
    mediaType: "audio",
    thumbnailUrl: null,
    professorId: professor1.id,
    duration: 1800, // 30 minutes
    transcript: null,
    tags: ["Computer Science", "AI", "Machine Learning"]
  });
  
  const podcast2 = await storage.createPodcast({
    title: "Deep Learning Fundamentals",
    description: "An introduction to neural networks and deep learning architectures.",
    mediaUrl: "/uploads/videos/sample-video-1.mp4", // This file doesn't exist, for demo only
    mediaType: "video",
    thumbnailUrl: null,
    professorId: professor1.id,
    duration: 2700, // 45 minutes
    transcript: null,
    tags: ["Computer Science", "AI", "Deep Learning"]
  });
  
  const podcast3 = await storage.createPodcast({
    title: "World War II: Key Events",
    description: "A comprehensive overview of the major events of World War II.",
    mediaUrl: "/uploads/audios/sample-audio-2.mp3", // This file doesn't exist, for demo only
    mediaType: "audio",
    thumbnailUrl: null,
    professorId: professor2.id,
    duration: 3600, // 60 minutes
    transcript: null,
    tags: ["History", "World War II", "20th Century"]
  });
  
  // Create test playlists
  const playlist1 = await storage.createPlaylist({
    title: "AI Study Materials",
    description: "Collection of lectures about artificial intelligence",
    userId: student1.id
  });
  
  const playlist2 = await storage.createPlaylist({
    title: "History Lectures",
    description: "Important history lectures for exam prep",
    userId: student2.id
  });
  
  // Add podcasts to playlists
  await storage.addPodcastToPlaylist({
    playlistId: playlist1.id,
    podcastId: podcast1.id,
    order: 0
  });
  
  await storage.addPodcastToPlaylist({
    playlistId: playlist1.id,
    podcastId: podcast2.id,
    order: 1
  });
  
  await storage.addPodcastToPlaylist({
    playlistId: playlist2.id,
    podcastId: podcast3.id,
    order: 0
  });
  
  // Create test comments
  await storage.createComment({
    content: "Great lecture, very informative!",
    userId: student1.id,
    podcastId: podcast1.id
  });
  
  await storage.createComment({
    content: "Could you explain the backpropagation algorithm in more detail?",
    userId: student2.id,
    podcastId: podcast2.id
  });
  
  await storage.createComment({
    content: "Excellent overview of the war's key turning points.",
    userId: student1.id,
    podcastId: podcast3.id
  });
  
  // Create test likes
  await storage.createLike({
    userId: student1.id,
    podcastId: podcast1.id
  });
  
  await storage.createLike({
    userId: student2.id,
    podcastId: podcast1.id
  });
  
  await storage.createLike({
    userId: student1.id,
    podcastId: podcast3.id
  });
  
  // Create test views
  await storage.createView({
    userId: student1.id,
    podcastId: podcast1.id
  });
  
  await storage.createView({
    userId: student1.id,
    podcastId: podcast2.id
  });
  
  await storage.createView({
    userId: student2.id,
    podcastId: podcast1.id
  });
  
  await storage.createView({
    userId: student2.id,
    podcastId: podcast3.id
  });
  
  console.log("Initial data seeding complete!");
  console.log(`Created ${await (await storage.getAllPodcasts()).length} podcasts`);
  console.log(`Created ${Object.keys(storage).length} users`);
}
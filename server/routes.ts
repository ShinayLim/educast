import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { setupAuth } from "./auth";
import {
  insertPodcastSchema,
  insertPlaylistSchema,
  insertPlaylistItemSchema,
  insertPodcastCommentSchema,
  insertPodcastViewSchema,
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const mediaType = file.mimetype.startsWith("video") ? "videos" : "audios";
      const uploadDir = path.join(process.cwd(), "uploads", mediaType);

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

const thumbnailUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads", "thumbnails");

      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Auth middleware to check if user is authenticated
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is a professor
const isProfessor = (req: any, res: any, next: any) => {
  if (req.isAuthenticated() && req.user.role === "professor") {
    return next();
  }
  res.status(403).json({ message: "Access denied" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // User routes
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    // User can only update their own profile
    if (req.user?.id !== req.params.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedUser = await storage.updateUser(
      parseInt(req.params.id),
      req.body
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't return password
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });

  // Podcast routes
  app.post(
    "/api/podcasts",
    isProfessor,
    upload.single("media"),
    async (req, res) => {
      try {
        const mediaFile = req.file;
        if (!mediaFile) {
          return res.status(400).json({ message: "No media file uploaded" });
        }

        const mediaUrl = `/uploads/${
          mediaFile.mimetype.startsWith("video") ? "videos" : "audios"
        }/${mediaFile.filename}`;
        const mediaType = mediaFile.mimetype.startsWith("video")
          ? "video"
          : "audio";

        const podcastData = {
          ...req.body,
          mediaUrl,
          mediaType,
          professorId: req.user?.id,
          tags: req.body.tags ? JSON.parse(req.body.tags) : [],
          duration: parseInt(req.body.duration) || 0,
        };

        const validatedData = insertPodcastSchema.parse(podcastData);
        const podcast = await storage.createPodcast(validatedData);

        res.status(201).json(podcast);
      } catch (error: unknown) {
        const err = error as Error;
        console.error("Error creating podcast:", err);
        res.status(400).json({ message: err.message });
      }
    }
  );

  // app.post(
  //   "/api/podcasts/:id/thumbnail",
  //   isProfessor,
  //   thumbnailUpload.single("thumbnail"),
  //   async (req, res) => {
  //     try {
  //       const podcastId = parseInt(req.params.id);
  //       const podcast = await storage.getPodcast(podcastId);

  //       if (!podcast) {
  //         return res.status(404).json({ message: "Podcast not found" });
  //       }

  //       // Check if user is the owner of the podcast
  //       if (podcast.professorId !== req.user?.id) {
  //         return res.status(403).json({ message: "Forbidden" });
  //       }

  //       const thumbnailFile = req.file;
  //       if (!thumbnailFile) {
  //         return res
  //           .status(400)
  //           .json({ message: "No thumbnail file uploaded" });
  //       }

  //       const thumbnailUrl = `/uploads/thumbnails/${thumbnailFile.filename}`;

  //       const updatedPodcast = await storage.updatePodcast(podcastId, {
  //         thumbnailUrl,
  //       });
  //       res.json(updatedPodcast);
  //     } catch (error: unknown) {
  //       const err = error as Error;
  //       console.error("Error uploading thumbnail:", err);
  //       res.status(400).json({ message: err.message });
  //     }
  //   }
  // );

  app.get("/api/podcasts", async (req, res) => {
    const podcasts = await storage.getAllPodcasts();
    res.json(podcasts);
    console.log("HELOOOOOO");
  });

  app.get("/api/podcasts/search", async (req, res) => {
    const query = req.query.q as string;
    if (!query) {
      return res
        .status(400)
        .json({ message: "Query parameter 'q' is required" });
    }

    const podcasts = await storage.searchPodcasts(query);
    res.json(podcasts);
  });

  app.get("/api/professors/:id/podcasts", async (req, res) => {
    const professorId = parseInt(req.params.id);
    const podcasts = await storage.getPodcastsByProfessorId(professorId);
    res.json(podcasts);
  });

  app.get("/api/podcasts/:id", async (req, res) => {
    const podcast = await storage.getPodcast(parseInt(req.params.id));
    if (!podcast) {
      return res.status(404).json({ message: "Podcast not found" });
    }
    res.json(podcast);
  });

  app.patch("/api/podcasts/:id", isProfessor, async (req, res) => {
    const podcastId = parseInt(req.params.id);
    const podcast = await storage.getPodcast(podcastId);

    if (!podcast) {
      return res.status(404).json({ message: "Podcast not found" });
    }

    // Check if user is the owner of the podcast
    if (podcast.professorId !== req.user?.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedPodcast = await storage.updatePodcast(podcastId, req.body);
    res.json(updatedPodcast);
  });

  app.delete("/api/podcasts/:id", isProfessor, async (req, res) => {
    const podcastId = parseInt(req.params.id);
    const podcast = await storage.getPodcast(podcastId);

    if (!podcast) {
      return res.status(404).json({ message: "Podcast not found" });
    }

    // Check if user is the owner of the podcast
    if (podcast.professorId !== req.user?.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await storage.deletePodcast(podcastId);
    res.status(204).send();
  });

  // Playlist routes
  // app.post("/api/playlists", isAuthenticated, async (req, res) => {
  //   try {
  //     const playlistData = {
  //       ...req.body,
  //       userId: req.user?.id,
  //     };

  //     const validatedData = insertPlaylistSchema.parse(playlistData);
  //     const playlist = await storage.createPlaylist(validatedData);

  //     res.status(201).json(playlist);
  //   } catch (error: unknown) {
  //     const err = error as Error;
  //     res.status(400).json({ message: err.message });
  //   }
  // });

  // app.get("/api/playlists", isAuthenticated, async (req, res) => {
  //   const playlists = await storage.getPlaylistsByUserId(
  //     parseInt(req.user?.id as string)
  //   );
  //   res.json(playlists);
  // });

  // app.get("/api/playlists/:id", isAuthenticated, async (req, res) => {
  //   const playlist = await storage.getPlaylist(parseInt(req.params.id));

  //   if (!playlist) {
  //     return res.status(404).json({ message: "Playlist not found" });
  //   }

  //   // Check if user is the owner of the playlist
  //   if (playlist.userId !== req.user?.id) {
  //     return res.status(403).json({ message: "Forbidden" });
  //   }

  //   res.json(playlist);
  // });

  // app.patch("/api/playlists/:id", isAuthenticated, async (req, res) => {
  //   const playlistId = parseInt(req.params.id);
  //   const playlist = await storage.getPlaylist(playlistId);

  //   if (!playlist) {
  //     return res.status(404).json({ message: "Playlist not found" });
  //   }

  //   // Check if user is the owner of the playlist
  //   if (playlist.userId !== req.user?.id) {
  //     return res.status(403).json({ message: "Forbidden" });
  //   }

  //   const updatedPlaylist = await storage.updatePlaylist(playlistId, req.body);
  //   res.json(updatedPlaylist);
  // });

  // app.delete("/api/playlists/:id", isAuthenticated, async (req, res) => {
  //   const playlistId = parseInt(req.params.id);
  //   const playlist = await storage.getPlaylist(playlistId);

  //   if (!playlist) {
  //     return res.status(404).json({ message: "Playlist not found" });
  //   }

  //   // Check if user is the owner of the playlist
  //   if (playlist.userId !== req.user?.id) {
  //     return res.status(403).json({ message: "Forbidden" });
  //   }

  //   await storage.deletePlaylist(playlistId);
  //   res.status(204).send();
  // });

  // // Playlist item routes
  // app.post("/api/playlist-items", isAuthenticated, async (req, res) => {
  //   try {
  //     const playlistId = parseInt(req.body.playlistId);
  //     const playlist = await storage.getPlaylist(playlistId);

  //     if (!playlist) {
  //       return res.status(404).json({ message: "Playlist not found" });
  //     }

  //     // Check if user is the owner of the playlist
  //     if (playlist.userId !== req.user?.id) {
  //       return res.status(403).json({ message: "Forbidden" });
  //     }

  //     // Get current playlist items to determine the next order
  //     const playlistItems = await storage.getPlaylistItems(playlistId);
  //     const nextOrder =
  //       playlistItems.length > 0
  //         ? Math.max(...playlistItems.map((item) => item.order)) + 1
  //         : 0;

  //     const playlistItemData = {
  //       ...req.body,
  //       order: nextOrder,
  //     };

  //     const validatedData = insertPlaylistItemSchema.parse(playlistItemData);
  //     const playlistItem = await storage.addPodcastToPlaylist(validatedData);

  //     res.status(201).json(playlistItem);
  //   } catch (error: unknown) {
  //     const err = error as Error;
  //     res.status(400).json({ message: err.message });
  //   }
  // });

  // app.get("/api/playlists/:id/items", isAuthenticated, async (req, res) => {
  //   const playlistId = parseInt(req.params.id);
  //   const playlist = await storage.getPlaylist(playlistId);

  //   if (!playlist) {
  //     return res.status(404).json({ message: "Playlist not found" });
  //   }

  //   // Check if user is the owner of the playlist
  //   if (playlist.userId !== req.user?.id) {
  //     return res.status(403).json({ message: "Forbidden" });
  //   }

  //   const playlistItems = await storage.getPlaylistItems(playlistId);
  //   res.json(playlistItems);
  // });

  // app.delete("/api/playlist-items/:id", isAuthenticated, async (req, res) => {
  //   const playlistItemId = parseInt(req.params.id);
  //   // TODO: Add check to verify user owns the playlist this item belongs to

  //   await storage.removePlaylistItem(playlistItemId);
  //   res.status(204).send();
  // });

  // Comment routes
  app.post("/api/podcasts/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const commentData = {
        content: req.body.content,
        userId: req.user?.id,
        podcastId: parseInt(req.params.id),
      };

      const validatedData = insertPodcastCommentSchema.parse(commentData);
      const comment = await storage.createComment(validatedData);

      res.status(201).json(comment);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/podcasts/:id/comments", async (req, res) => {
    const podcastId = parseInt(req.params.id);
    const comments = await storage.getCommentsByPodcastId(podcastId);
    res.json(comments);
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    // TODO: Add check to verify user owns the comment or is a professor
    const commentId = parseInt(req.params.id);
    await storage.deleteComment(commentId);
    res.status(204).send();
  });

  // Like routes
  // app.post("/api/podcasts/:id/likes", isAuthenticated, async (req, res) => {
  //   try {
  //     const podcastId = parseInt(req.params.id);

  //     // Check if the user already liked this podcast
  //     const existingLike = await storage.getLikeByUserAndPodcast(req.user?.id, podcastId);
  //     if (existingLike) {
  //       return res.status(400).json({ message: "User already liked this podcast" });
  //     }

  //     const likeData = {
  //       userId: req.user?.id,
  //       podcastId,
  //     };

  //     const validatedData = insertLikeSchema.parse(likeData);
  //     const like = await storage.createLike(validatedData);

  //     res.status(201).json(like);
  //   } catch (error) {
  //     res.status(400).json({ message: error.message });
  //   }
  // });

  // app.get("/api/podcasts/:id/likes", async (req, res) => {
  //   const podcastId = parseInt(req.params.id);
  //   const likes = await storage.getLikesByPodcastId(podcastId);
  //   res.json(likes);
  // });

  // app.delete("/api/podcasts/:id/likes", isAuthenticated, async (req, res) => {
  //   const podcastId = parseInt(req.params.id);
  //   const like = await storage.getLikeByUserAndPodcast(req.user?.id, podcastId);

  //   if (!like) {
  //     return res.status(404).json({ message: "Like not found" });
  //   }

  //   await storage.deleteLike(like.id);
  //   res.status(204).send();
  // });

  // View routes
  app.post("/api/podcasts/:id/views", isAuthenticated, async (req, res) => {
    try {
      const viewData = {
        userId: req.user?.id,
        podcastId: parseInt(req.params.id),
      };

      const validatedData = insertPodcastViewSchema.parse(viewData);
      const view = await storage.createView(validatedData);

      res.status(201).json(view);
    } catch (error: unknown) {
      const err = error as Error;
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/podcasts/:id/views", async (req, res) => {
    const podcastId = parseInt(req.params.id);
    const views = await storage.getViewsByPodcastId(podcastId);
    res.json(views);
  });

  const httpServer = createServer(app);
  return httpServer;
}

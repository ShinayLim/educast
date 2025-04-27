import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import * as dotenv from "dotenv";
import path from "path";
import { log, setupVite, serveStatic } from "./vite";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Body parsing middleware
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Global error handler middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Global error handler:", err);
  
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Bad request: Invalid JSON" });
  }
  
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Create uploads directories if they don't exist
const makeUploadsDirectories = () => {
  const fs = require('fs');
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const dirs = [
    uploadsDir,
    path.join(uploadsDir, 'videos'),
    path.join(uploadsDir, 'audios'),
    path.join(uploadsDir, 'thumbnails'),
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

makeUploadsDirectories();

// Register API routes and create HTTP server
async function startApp() {
  try {
    const httpServer = await registerRoutes(app);
    
    // In development, use Vite for the frontend
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, httpServer);
    } else {
      // In production, serve static files from the dist directory
      serveStatic(app);
    }

    // Get the port from environment variable or use 5000 as default
    const PORT = process.env.PORT || 5000;
    
    httpServer.listen(PORT, () => {
      log(`serving on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

startApp();
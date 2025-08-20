// server\index.ts

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import supabase from "@/lib/supabase"; // relative import
import { insertPlaylistSchema } from "@shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// ✅ Add this route before error middleware and Vite setup
app.get("/api/professors/:id/podcasts", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("professor_id", id);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Route error:", err);
    res
      .status(500)
      .json({ message: (err as Error).message || "Unknown error" });
  }
});

app.post("/", async (req: Request, res: Response) => {
  try {
    // Validate with zod
    const parsed = insertPlaylistSchema.parse(req.body);

    const { data, error } = await supabase
      .from("playlists")
      .insert(parsed)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("Validation/Route error:", err);
    res
      .status(400)
      .json({ message: (err as Error).message || "Invalid request body" });
  }
});

app.get("/api/students/:id/playlists", async (req: Request, res: Response) => {
  const userId = req.query.user_id as string;
  if (!userId) {
    return res.status(400).json({ message: "user_id query param is required" });
  }

  try {
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ message: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Route error:", err);
    res
      .status(500)
      .json({ message: (err as Error).message || "Unknown error" });
  }
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();

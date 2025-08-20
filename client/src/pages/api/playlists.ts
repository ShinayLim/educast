// // client\src\pages\api\playlists.ts
// import { Router, type Request, type Response } from "express";
// import supabase from "@/lib/supabase"; // adjust if needed
// import { insertPlaylistSchema } from "@shared/schema";

// const router = Router();

// // ✅ POST /api/playlists - create new playlist
// router.post("/", async (req: Request, res: Response) => {
//   try {
//     // Validate with zod
//     const parsed = insertPlaylistSchema.parse(req.body);

//     const { data, error } = await supabase
//       .from("playlists")
//       .insert(parsed)
//       .select("*")
//       .single();

//     if (error) {
//       console.error("Supabase error:", error);
//       return res.status(500).json({ message: error.message });
//     }

//     res.status(201).json(data);
//   } catch (err) {
//     console.error("Validation/Route error:", err);
//     res
//       .status(400)
//       .json({ message: (err as Error).message || "Invalid request body" });
//   }
// });

// // ✅ GET /api/playlists - list playlists for a user
// router.get("/", async (req: Request, res: Response) => {
//   const userId = req.query.user_id as string;
//   if (!userId) {
//     return res.status(400).json({ message: "user_id query param is required" });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("playlists")
//       .select("*")
//       .eq("user_id", userId)
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Supabase error:", error);
//       return res.status(500).json({ message: error.message });
//     }

//     res.json(data);
//   } catch (err) {
//     console.error("Route error:", err);
//     res
//       .status(500)
//       .json({ message: (err as Error).message || "Unknown error" });
//   }
// });

// export default router;

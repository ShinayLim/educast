// src/lib/metadata.ts
export const metadata = {
  "/auth": {
    title: "EduCast | Auth",
    description: "Log-in or Register to EduCast.",
  },
  "/": {
    title: "EduCast | Home",
    description: "Welcome to EduCast's homepage.",
  },
  "/search": {
    title: "EduCast | Search",
    description: "Search podcasts and playlists on EduCast.",
  },
  "/playlist/:id": {
    title: "EduCast | Playlist",
    description: "View and listen to your selected playlist.",
  },
  "/podcast/:id": {
    title: "EduCast | Podcast",
    description: "Listen to podcasts uploaded by professors.",
  },
  "/student/library": {
    title: "EduCast | Your Library",
    description: "Access your playlists and liked content on EduCast",
  },
  "/superadmin/dashboard": {
    title: "EduCast | Super Admin Dashboard",
    description: "Manage EduCast as a Super Admin.",
  },
  "*": {
    title: "EduCast | Not Found",
    description: "The page you are looking for does not exist.",
  },
};

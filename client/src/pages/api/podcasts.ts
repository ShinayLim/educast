// client/src/lib/podcasts.ts
import { supabase } from './../../lib/supabase';

export type PodcastInput = {
  title: string;
  description: string;
  youtubeUrl: string;
  tags?: string[];
};

export async function uploadPodcast(podcast: PodcastInput) {
  const { title, description, youtubeUrl, tags = [] } = podcast;

  // Validate YouTube URL
  const isValidYoutubeUrl = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(youtubeUrl);
  if (!isValidYoutubeUrl) {
    throw new Error("Invalid YouTube URL");
  }

  const { error, data } = await supabase.from("podcasts").insert([
    {
      title,
      description,
      youtube_url: youtubeUrl,
      tags,
    },
  ]);

  if (error) {
    throw new Error(error.message || "Failed to upload podcast");
  }

  return data;
}

export async function fetchAllPodcasts() {
  const { data, error } = await supabase
    .from("podcasts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to fetch podcasts");
  }

  return data;
}

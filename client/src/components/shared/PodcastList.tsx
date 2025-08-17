import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Podcast } from "@shared/schema";

// Define Podcast type
// type Podcast = {
//   id: string;
//   title: string;
//   description: string;
//   youtube_url: string;
//   tags?: string[];
//   created_at?: string;
// };

// Define the prop types for PodcastList
type PodcastListProps = {
  podcasts: Podcast[];
  emptyMessage?: string;
  variant?: "default" | "list" | "compact"; // ✅ allow "compact"
  showActions?: boolean; // ✅ allow showActions
};

// Extract YouTube video ID from a URL
function getYoutubeId(url: string | undefined | null): string | null {
  if (!url) return null;

  const regExp =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&?]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// The actual PodcastList component
export default function PodcastList({
  podcasts,
  emptyMessage = "No podcasts found",
  variant = "default",
}: PodcastListProps) {
  if (!podcasts.length) {
    return (
      <div className="text-muted-foreground text-center py-8">
        {emptyMessage}
      </div>
    );
  }

  console.log("Podcast data:", podcasts);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {podcasts.map((podcast: Podcast) => {
        const videoId = podcast.youtube_url
          ? getYoutubeId(podcast.youtube_url)
          : null;

        return (
          <Card key={podcast.id}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                <Link
                  href={`/player/${podcast.id}`}
                  className="font-medium hover:underline"
                >
                  {podcast.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2 text-muted-foreground">
                {podcast.description}
              </CardDescription>
              {(podcast.tags ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(podcast.tags ?? []).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {videoId ? (
                <iframe
                  title="Podcast Video"
                  className="w-full aspect-video rounded-b-md"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <div className="p-4 text-sm text-destructive">
                  No video available
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

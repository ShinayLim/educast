import { Link } from "wouter";
import {
  Play,
  Clock,
  MoreVertical,
  Heart,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";
import { useState } from "react";

interface PodcastCardProps {
  id: number;
  title: string;
  author: string;
  authorId: number;
  thumbnailUrl?: string;
  duration?: number;
  mediaType: "audio" | "video";
  isNew?: boolean;
  isPopular?: boolean;
  className?: string;
  likes?: number; // Add this
  dislikes?: number; // Add this
  isLiked?: boolean; // Add this
  onLike?: () => void;
}

export function PodcastCard({
  id,
  title,
  author,
  authorId,
  thumbnailUrl,
  duration,
  mediaType,
  isNew = false,
  isPopular = false,
  className,
  likes = 0,
  dislikes = 0,
  isLiked = false,
  onLike,
}: PodcastCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(isLiked);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like podcasts",
        variant: "destructive",
      });
      return;
    }

    try {
      if (liked) {
        await supabase
          .from("podcast_likes")
          .delete()
          .eq("podcast_id", id)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("podcast_likes")
          .insert({ podcast_id: id, user_id: user.id });
      }

      setLiked(!liked);
      if (onLike) onLike();

      toast({
        title: liked ? "Removed from liked" : "Added to liked",
        description: `"${title}" has been ${
          liked ? "removed from" : "added to"
        } your liked podcasts`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  // Default thumbnails if not provided
  const defaultAudioThumbnail =
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
  const defaultVideoThumbnail =
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";

  const thumbnailSrc =
    thumbnailUrl ||
    (mediaType === "audio" ? defaultAudioThumbnail : defaultVideoThumbnail);

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "Unknown";

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }

    return `${minutes}m`;
  };

  return (
    <div
      className={cn(
        "podcast-card rounded-lg overflow-hidden bg-card border border-border transition-all",
        className
      )}
    >
      <Link href={`/player/${id}`}>
        <div className="block cursor-pointer">
          <div className="relative">
            <img
              src={thumbnailSrc}
              alt={title}
              className="w-full h-40 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isNew && (
                    <span className="px-2 py-1 bg-primary/90 rounded-md text-xs font-semibold text-primary-foreground">
                      NEW
                    </span>
                  )}
                  {isPopular && (
                    <span className="px-2 py-1 bg-orange-500/90 rounded-md text-xs font-semibold text-white">
                      POPULAR
                    </span>
                  )}
                  <span className="px-2 py-1 bg-secondary/80 rounded-md text-xs font-semibold">
                    {mediaType === "audio" ? "AUDIO" : "VIDEO"}
                  </span>
                </div>

                {duration && (
                  <div className="flex items-center text-xs text-white/90">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDuration(duration)}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/player/${id}`}>
          <div className="block cursor-pointer">
            <h3 className="font-bold text-base line-clamp-1 hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
        </Link>

        <Link href={`/professor/${authorId}`}>
          <div className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            {author}
          </div>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <Button asChild variant="default" size="sm" className="rounded-full">
            <Link href={`/player/${id}`}>
              <div className="flex items-center gap-1 cursor-pointer">
                <Play className="h-4 w-4" />
                Listen now
              </div>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Add to playlist</DropdownMenuItem>
              <DropdownMenuItem>Save for later</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem>Download</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Podcast } from "@shared/schema";
import { Play, Heart, Clock, MoreHorizontal, Download } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface PodcastCardProps {
  podcast: Podcast;
  onPlay: (podcast: Podcast) => void;
  variant?: "default" | "compact" | "list";
}

export default function PodcastCard({ 
  podcast, 
  onPlay,
  variant = "default" 
}: PodcastCardProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        // This is a simplified example; in a real app, you'd store the like ID
        // await apiRequest("DELETE", `/api/likes/${likeId}`);
        return false;
      } else {
        await apiRequest("POST", "/api/likes", { podcastId: podcast.id });
        return true;
      }
    },
    onSuccess: (liked) => {
      setIsLiked(liked);
      toast({
        title: liked ? "Added to Liked Podcasts" : "Removed from Liked Podcasts",
        description: liked ? "This podcast has been added to your library" : "This podcast has been removed from your library",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    likeMutation.mutate();
  };

  const handleDownload = () => {
    if (!podcast.audioUrl) {
      toast({
        title: "Download failed",
        description: "Audio file not available for download",
        variant: "destructive",
      });
      return;
    }
    
    // Create a temporary anchor to trigger download
    const a = document.createElement("a");
    a.href = podcast.audioUrl;
    a.download = `${podcast.title.replace(/\s+/g, "_")}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download started",
      description: "Your podcast is being downloaded",
    });
  };

  if (variant === "compact") {
    return (
      <div className="podcast-card flex items-center p-2 rounded-md hover:bg-accent/50">
        <img 
          src={podcast.coverArt || "https://via.placeholder.com/60x60?text=Podcast"} 
          alt={podcast.title} 
          className="h-12 w-12 rounded object-cover"
        />
        <div className="ml-3 flex-1 min-w-0">
          <Link href={`/podcast/${podcast.id}`}>
            <a className="text-sm font-medium hover:underline truncate block">
              {podcast.title}
            </a>
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            {podcast.category || "Educational Podcast"}
          </p>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 text-primary"
          onClick={() => onPlay(podcast)}
        >
          <Play className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  if (variant === "list") {
    return (
      <div className="podcast-card flex items-center p-3 rounded-md hover:bg-accent/50">
        <div className="flex items-center flex-1">
          <img 
            src={podcast.coverArt || "https://via.placeholder.com/80x80?text=Podcast"} 
            alt={podcast.title} 
            className="h-14 w-14 rounded object-cover"
          />
          <div className="ml-4 min-w-0">
            <Link href={`/podcast/${podcast.id}`}>
              <a className="text-base font-medium hover:underline truncate block">
                {podcast.title}
              </a>
            </Link>
            <p className="text-sm text-muted-foreground truncate">
              {podcast.category || "Educational Podcast"}
            </p>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(podcast.duration || 0)}
              <span className="mx-2">•</span>
              {podcast.plays || 0} plays
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={() => onPlay(podcast)}
          >
            <Play className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/podcast/${podcast.id}`)}>
                View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
  
  // Default card
  return (
    <div className="podcast-card rounded-xl overflow-hidden bg-card border">
      <div className="relative group">
        <img 
          src={podcast.coverArt || "https://via.placeholder.com/300x200?text=Podcast"} 
          alt={podcast.title} 
          className="w-full aspect-square object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={() => onPlay(podcast)}
          >
            <Play className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <Link href={`/podcast/${podcast.id}`}>
          <a className="text-base font-medium hover:underline line-clamp-1">
            {podcast.title}
          </a>
        </Link>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {podcast.description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(podcast.duration || 0)}
            <span className="mx-1">•</span>
            {podcast.plays || 0} plays
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8"
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : ""}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/podcast/${podcast.id}`)}>
                  View details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

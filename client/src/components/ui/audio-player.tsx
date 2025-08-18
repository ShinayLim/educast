import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Heart,
  HeartCrack,
  Share2,
  ListPlus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface AudioPlayerProps {
  audioSrc: string;
  title: string;
  author: string;
  thumbnailUrl?: string;
  podcastId: number;
  isLiked?: boolean;
  canDownload?: boolean;
  className?: string;
}

export function AudioPlayer({
  audioSrc,
  title,
  author,
  thumbnailUrl,
  podcastId,
  isLiked = false,
  canDownload = true,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Register view when component mounts
    const registerView = async () => {
      try {
        if (user) {
          await apiRequest("POST", `/api/podcasts/${podcastId}/views`);
        }
      } catch (error) {
        console.error("Failed to register view:", error);
      }
    };

    registerView();
  }, [podcastId, user]);

  useEffect(() => {
    // Update audio element muted state
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    // Update audio element volume
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle audio element events
  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Player controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(
        Math.max(0, audioRef.current.currentTime + seconds),
        duration
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await apiRequest("DELETE", `/api/podcasts/${podcastId}/likes`);
        setLiked(false);
        toast({
          title: "Removed from liked podcasts",
          description: `"${title}" has been removed from your liked podcasts.`,
        });
      } else {
        await apiRequest("POST", `/api/podcasts/${podcastId}/likes`);
        setLiked(true);
        toast({
          title: "Added to liked podcasts",
          description: `"${title}" has been added to your liked podcasts.`,
        });
      }
      // Invalidate cache for this podcast
      queryClient.invalidateQueries({
        queryKey: [`/api/podcasts/${podcastId}`],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioSrc;
    link.download = `${title.replace(/\s+/g, "_")}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: `Downloading "${title}"`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: title,
          text: `Listen to ${title} by ${author}`,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copied",
          description: "Podcast link copied to clipboard.",
        });
      });
    }
  };

  return (
    <div
      className={cn(
        "w-full p-4 audio-player rounded-lg fixed bottom-0 left-0 right-0 z-50",
        className
      )}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />

      <div className="flex items-center justify-between">
        {/* Podcast info */}
        <div className="flex items-center gap-3 w-1/4">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div className="truncate">
            <h4 className="font-medium text-sm truncate">{title}</h4>
            <p className="text-xs text-muted-foreground truncate">{author}</p>
          </div>
        </div>

        {/* Player controls */}
        <div className="flex flex-col items-center w-1/2">
          <div className="flex items-center gap-4 mb-2">
            <button
              title="Rewind 10 seconds"
              onClick={() => skip(-10)}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipBack size={20} />
            </button>
            <button
              title="Play/Pause"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              title="Skip forward 10 seconds"
              onClick={() => skip(10)}
              className="text-muted-foreground hover:text-foreground"
            >
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Additional controls */}
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <div className="flex items-center gap-2">
            <button
              title="Mute/Unmute"
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  title="Like/Unlike"
                  onClick={handleLike}
                  className={cn(
                    "p-1 rounded-full hover:bg-secondary",
                    liked && "text-destructive"
                  )}
                >
                  {liked ? <HeartCrack size={20} /> : <Heart size={20} />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {liked ? "Remove from liked" : "Add to liked"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  title="Share"
                  onClick={handleShare}
                  className="p-1 rounded-full hover:bg-secondary"
                >
                  <Share2 size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>

            {canDownload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    title="Download"
                    onClick={handleDownload}
                    className="p-1 rounded-full hover:bg-secondary"
                  >
                    <Download size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Download</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  title="Add to playlist"
                  className="p-1 rounded-full hover:bg-secondary"
                >
                  <ListPlus size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Add to playlist</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

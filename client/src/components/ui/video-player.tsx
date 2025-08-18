import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Heart,
  HeartCrack,
  Download,
  Share2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface VideoPlayerProps {
  videoSrc: string;
  title: string;
  author: string;
  podcastId: number;
  isLiked?: boolean;
  canDownload?: boolean;
  className?: string;
  captionsSrc?: string;
}

export function VideoPlayer({
  videoSrc,
  title,
  author,
  podcastId,
  isLiked = false,
  canDownload = true,
  className,
  captionsSrc,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [liked, setLiked] = useState(isLiked);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }

      setShowControls(true);

      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    // Update video element muted state
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    // Update video element volume
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Update video element playback rate
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Handle video element events
  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoClick = () => {
    togglePlay();
  };

  const handleMouseMove = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setShowControls(true);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = value[0];
      videoRef.current.currentTime = newTime;
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

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch((err) => {
            console.error(
              `Error attempting to enable fullscreen: ${err.message}`
            );
          });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
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
    link.href = videoSrc;
    link.download = `${title.replace(/\s+/g, "_")}.mp4`;
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
          text: `Watch ${title} by ${author}`,
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

  const toggleCaptions = () => {
    setCaptionsEnabled(!captionsEnabled);

    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      if (tracks.length > 0) {
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].mode = captionsEnabled ? "hidden" : "showing";
        }
      }
    }
  };

  const setSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-black",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full"
        onClick={handleVideoClick}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      >
        {captionsSrc && (
          <track
            src={captionsSrc}
            kind="subtitles"
            label="English"
            srcLang="en"
            default={captionsEnabled}
          />
        )}
      </video>

      {/* Video controls overlay */}
      {showControls && (
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/30">
          {/* Top controls */}
          <div className="p-4 flex justify-between items-center">
            <div>
              <h3 className="text-white font-medium">{title}</h3>
              <p className="text-white/70 text-sm">{author}</p>
            </div>

            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLike}
                      className={cn(
                        "p-1 rounded-full hover:bg-white/20 text-white",
                        liked && "text-red-500"
                      )}
                    >
                      {liked ? <HeartCrack size={20} /> : <Heart size={20} />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {liked ? "Remove from liked" : "Add to liked"}
                  </TooltipContent>
                </Tooltip>

                {canDownload && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        title="Download"
                        onClick={handleDownload}
                        className="p-1 text-white rounded-full hover:bg-white/20"
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
                      title="Share"
                      onClick={handleShare}
                      className="p-1 text-white rounded-full hover:bg-white/20"
                    >
                      <Share2 size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Center play button */}
          {!isPlaying && (
            <button
              title="Play"
              onClick={togglePlay}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary bg-opacity-80 flex items-center justify-center"
            >
              <Play size={30} className="text-white" />
            </button>
          )}

          {/* Bottom controls */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-white">
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
              <span className="text-xs text-white">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-white/80"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-white/80"
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
              </div>

              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      title="Settings"
                      className="text-white hover:text-white/80"
                    >
                      <Settings size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={toggleCaptions}>
                      {captionsEnabled ? "Disable Captions" : "Enable Captions"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSpeed(0.5)}>
                      Speed: 0.5x {playbackSpeed === 0.5 && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSpeed(1)}>
                      Speed: Normal {playbackSpeed === 1 && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSpeed(1.5)}>
                      Speed: 1.5x {playbackSpeed === 1.5 && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSpeed(2)}>
                      Speed: 2x {playbackSpeed === 2 && "✓"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-white/80"
                >
                  {isFullscreen ? (
                    <Minimize size={20} />
                  ) : (
                    <Maximize size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

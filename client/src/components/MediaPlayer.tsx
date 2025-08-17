import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  X,
  ListMusic,
  Download,
  Share2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CommentSection from "@/components/CommentSection";

interface PodcastItem {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  mediaUrl: string;
  mediaType: string;
  transcript: string | null;
  professorId: number;
  duration: number | null;
}

interface MediaPlayerProps {
  podcast: PodcastItem;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

export default function MediaPlayer({
  podcast,
  onClose,
  onMinimize,
  isMinimized,
}: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const mediaRef = podcast.mediaType.startsWith("video") ? videoRef : audioRef;
  const isVideo = podcast.mediaType.startsWith("video");

  // Record a view when the media starts playing
  const viewMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/podcasts/${podcast.id}/views`);
    },
    onError: (error) => {
      console.error("Failed to record view:", error);
    },
  });

  useEffect(() => {
    // Initialize the media element
    if (mediaRef.current) {
      if (!isPlaying) {
        mediaRef.current.pause();
      } else {
        const playPromise = mediaRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Record a view once the media starts playing
              if (currentTime < 1) {
                viewMutation.mutate();
              }
            })
            .catch((error) => {
              console.error("Error playing media:", error);
              setIsPlaying(false);
            });
        }
      }
    }
  }, [isPlaying, mediaRef, currentTime, viewMutation, podcast.id]);

  // Update playback rate when changed
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, mediaRef]);

  // Update volume when changed
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, mediaRef]);

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = value;
      setCurrentTime(value);
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

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (mediaRef.current) {
      mediaRef.current.currentTime = 0;
    }
  };

  const handleDownload = () => {
    // Create a temporary link to trigger download
    const link = document.createElement("a");
    link.href = podcast.mediaUrl;
    link.download = `${podcast.title}.${
      podcast.mediaType.split("/")[1] || "mp3"
    }`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: `Downloading ${podcast.title}...`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: podcast.title,
          text: podcast.description,
          url: window.location.href,
        })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing:", error));
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Podcast link copied to clipboard",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    let result = "";
    if (hrs > 0) {
      result += `${hrs}:${mins < 10 ? "0" : ""}`;
    }
    result += `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    return result;
  };

  // Render a minimized player if minimized
  if (isMinimized) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-2 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{podcast.title}</h4>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMinimize()}
            className="rounded-full"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isVideo ? (
          <video
            ref={videoRef}
            src={podcast.mediaUrl}
            className="hidden"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          >
            {podcast.transcript && (
              <track
                kind="subtitles"
                src={`data:text/vtt;base64,${btoa(podcast.transcript)}`}
                srcLang="en"
                label="English"
                default={showCaptions}
              />
            )}
          </video>
        ) : (
          <audio
            ref={audioRef}
            src={podcast.mediaUrl}
            className="hidden"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          {podcast.thumbnailUrl && (
            <img
              src={podcast.thumbnailUrl}
              alt={podcast.title}
              className="w-10 h-10 rounded object-cover"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">{podcast.title}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onMinimize()}>
            <Minimize2 className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex flex-col md:flex-row">
        <div className={`md:w-${isVideo ? "3/4" : "1/2"} flex flex-col`}>
          {isVideo ? (
            <div className="relative bg-black flex-1 flex items-center justify-center">
              {isLoading ? (
                <div className="animate-pulse text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={podcast.mediaUrl}
                  className="max-h-full max-w-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                >
                  {podcast.transcript && (
                    <track
                      kind="subtitles"
                      src={`data:text/vtt;base64,${btoa(podcast.transcript)}`}
                      srcLang="en"
                      label="English"
                      default={showCaptions}
                    />
                  )}
                </video>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-md aspect-square rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {podcast.thumbnailUrl ? (
                  <img
                    src={podcast.thumbnailUrl}
                    alt={podcast.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ListMusic className="h-24 w-24 text-muted-foreground" />
                )}

                <audio
                  ref={audioRef}
                  src={podcast.mediaUrl}
                  className="hidden"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                />
              </div>
            </div>
          )}

          <div className="p-4 space-y-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={(values) => handleSeek(values[0])}
                className="mx-2 flex-1"
              />
              <span className="text-sm text-muted-foreground">
                {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>

                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-24"
                />
              </div>

              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" disabled>
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  variant="default"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button variant="ghost" size="icon" disabled>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  title="Playback Speed"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="bg-secondary text-sm rounded px-2 py-1"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>

                {isVideo && podcast.transcript && (
                  <Button
                    variant={showCaptions ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowCaptions(!showCaptions)}
                  >
                    CC
                  </Button>
                )}

                <Button variant="ghost" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`md:w-${
            isVideo ? "1/4" : "1/2"
          } border-t md:border-t-0 md:border-l overflow-auto`}
        >
          <Tabs
            defaultValue="details"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex-1">
                Comments
              </TabsTrigger>
              {podcast.transcript && (
                <TabsTrigger value="transcript" className="flex-1">
                  Transcript
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details" className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{podcast.title}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {podcast.description}
                  </p>
                </div>

                {podcast.duration && (
                  <div>
                    <h4 className="text-sm font-medium">Duration</h4>
                    <p className="text-sm">{formatTime(podcast.duration)}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="p-4">
              <CommentSection podcastId={podcast.id} />
            </TabsContent>

            {podcast.transcript && (
              <TabsContent value="transcript" className="p-4">
                <div className="text-sm whitespace-pre-line">
                  {podcast.transcript}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

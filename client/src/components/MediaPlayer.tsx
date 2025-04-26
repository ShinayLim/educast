import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Podcast } from "@shared/schema";
import { Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import PlayerControls from "./PlayerControls";
import { useAuth } from "@/hooks/use-auth";

interface MediaPlayerProps {
  podcast: Podcast;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

export default function MediaPlayer({ 
  podcast, 
  onClose, 
  onMinimize,
  isMinimized 
}: MediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Load podcast metadata
  const { data: podcastData } = useQuery<Podcast>({
    queryKey: [`/api/podcasts/${podcast.id}`],
    initialData: podcast,
  });

  // Register play event
  useEffect(() => {
    const registerPlay = async () => {
      try {
        if (user) {
          await apiRequest("POST", `/api/podcasts/${podcast.id}/play`);
        }
      } catch (error) {
        console.error("Failed to register play:", error);
      }
    };

    if (isPlaying) {
      registerPlay();
    }
  }, [podcast.id, isPlaying, user]);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const navigateToPodcast = () => {
    navigate(`/podcast/${podcast.id}`);
  };

  return (
    <div className={`media-player p-3 ${isMinimized ? 'h-16' : 'h-24'}`}>
      <audio 
        ref={audioRef} 
        src={podcastData?.audioUrl} 
        preload="metadata"
      />
      
      <div className="flex items-center h-full">
        {/* Cover art and title */}
        <div 
          className="flex items-center gap-3 w-64 cursor-pointer" 
          onClick={navigateToPodcast}
        >
          <img 
            src={podcastData?.coverArt || "https://via.placeholder.com/60x60?text=Podcast"} 
            alt={podcastData?.title} 
            className="h-10 w-10 rounded object-cover"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-medium truncate">{podcastData?.title}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {podcastData?.category || "Educational Podcast"}
            </p>
          </div>
        </div>
        
        {/* Player controls */}
        <div className="flex-1 px-4">
          {!isMinimized && (
            <PlayerControls 
              audioRef={audioRef}
              isPlaying={isPlaying}
              toggle={togglePlayPause}
              duration={duration || 0}
              currentTime={currentTime}
              onSeek={handleSeek}
            />
          )}
          {isMinimized && isPlaying && (
            <div className="flex items-center justify-center h-full gap-1">
              {/* Audio visualizer for mini player */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i}
                  className="visualizer-bar w-1 h-4 mx-0.5" 
                  style={{ animationDelay: `${i * -0.1}s` }}
                ></div>
              ))}
            </div>
          )}
          {isMinimized && !isPlaying && (
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-muted-foreground">Paused</span>
            </div>
          )}
        </div>
        
        {/* Control buttons */}
        <div className="flex items-center gap-2">
          {isMinimized && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={togglePlayPause}
              className="h-8 w-8"
            >
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onMinimize}
            className="h-8 w-8"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

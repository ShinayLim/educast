import { useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/utils";

interface PlayerControlsProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  toggle: () => void;
  duration: number;
  currentTime: number;
  onSeek: (value: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function PlayerControls({
  audioRef,
  isPlaying,
  toggle,
  duration,
  currentTime,
  onSeek,
  onPrevious,
  onNext
}: PlayerControlsProps) {
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);

  // Update audio volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioRef]);

  const handleVolumeChange = (newValue: number[]) => {
    setVolume(newValue[0]);
    setIsMuted(newValue[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleRepeat = () => {
    setIsRepeatOn(!isRepeatOn);
    if (audioRef.current) {
      audioRef.current.loop = !isRepeatOn;
    }
  };

  const toggleShuffle = () => {
    setIsShuffleOn(!isShuffleOn);
  };

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="flex items-center gap-2 w-full mb-2">
        <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
        <div className="flex-1 media-progress rounded-full overflow-hidden" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          onSeek(percent * duration);
        }}>
          <div 
            className="media-progress-bar rounded-full" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            className={`p-1 rounded-full ${isShuffleOn ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
            onClick={toggleShuffle}
          >
            <Shuffle size={16} />
          </button>
          <button 
            className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            onClick={onPrevious}
            disabled={!onPrevious}
          >
            <SkipBack size={20} />
          </button>
          <button 
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            onClick={toggle}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button 
            className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            onClick={onNext}
            disabled={!onNext}
          >
            <SkipForward size={20} />
          </button>
          <button 
            className={`p-1 rounded-full ${isRepeatOn ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
            onClick={toggleRepeat}
          >
            <Repeat size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-28">
          <button 
            className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
    </div>
  );
}

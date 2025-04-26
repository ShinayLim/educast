import { useState } from "react";
import { PodcastCard } from "./podcast-card";
import { Podcast } from "@shared/schema";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PodcastListProps {
  title: string;
  podcasts: Podcast[];
  emptyMessage?: string;
  showMore?: boolean;
  onShowMore?: () => void;
  className?: string;
}

export function PodcastList({
  title,
  podcasts,
  emptyMessage = "No podcasts found",
  showMore = false,
  onShowMore,
  className,
}: PodcastListProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollAmount = 300; // Pixels to scroll
  
  const handleScrollLeft = () => {
    const container = document.getElementById(`podcast-list-${title.replace(/\s+/g, '-')}`);
    if (container) {
      const newPosition = Math.max(0, scrollPosition - scrollAmount);
      container.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };
  
  const handleScrollRight = () => {
    const container = document.getElementById(`podcast-list-${title.replace(/\s+/g, '-')}`);
    if (container) {
      const newPosition = scrollPosition + scrollAmount;
      container.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };

  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl">{title}</h2>
        
        <div className="flex items-center gap-2">
          {podcasts.length > 4 && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={handleScrollLeft}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={handleScrollRight}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {showMore && (
            <Button 
              variant="link" 
              onClick={onShowMore}
              className="text-primary"
            >
              See all
            </Button>
          )}
        </div>
      </div>
      
      {podcasts.length > 0 ? (
        <div 
          id={`podcast-list-${title.replace(/\s+/g, '-')}`}
          className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
          style={{ scrollBehavior: 'smooth' }}
        >
          {podcasts.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              id={podcast.id}
              title={podcast.title}
              author={podcast.professorName || "Unknown Professor"} // This would need to be fetched or populated
              authorId={podcast.professorId}
              thumbnailUrl={podcast.thumbnailUrl}
              duration={podcast.duration}
              mediaType={podcast.mediaType as "audio" | "video"}
              className="min-w-[250px] md:min-w-[280px] flex-shrink-0"
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

import { Podcast, User } from "@shared/schema";
import { Link } from "wouter";
import { AudioPlayer } from "@/components/ui/audio-player";
import { VideoPlayer } from "@/components/ui/video-player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, BarChart2, User as UserIcon, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CommentSection } from "./comment-section";

interface PodcastDetailsProps {
  podcast: Podcast;
  professor?: User;
  isLiked: boolean;
}

export function PodcastDetails({ podcast, professor, isLiked }: PodcastDetailsProps) {
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "Unknown";
    
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    
    return `${minutes}m`;
  };
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Unknown date";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        {podcast.mediaType === "video" ? (
          <VideoPlayer
            videoSrc={podcast.mediaUrl}
            title={podcast.title}
            author={professor?.fullName || "Unknown Professor"}
            podcastId={podcast.id}
            isLiked={isLiked}
            captionsSrc={podcast.transcript ? `/uploads/transcripts/${podcast.id}.vtt` : undefined}
            className="aspect-video rounded-lg overflow-hidden"
          />
        ) : (
          <div className="mb-16">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <img 
                src={podcast.thumbnailUrl || "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"} 
                alt={podcast.title}
                className="w-64 h-64 object-cover rounded-lg shadow-lg"
              />
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{podcast.title}</h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <Link href={`/professor/${podcast.professorId}`}>
                    <a className="text-primary hover:underline">
                      {professor?.fullName || "Unknown Professor"}
                    </a>
                  </Link>
                  
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                  
                  <span className="text-muted-foreground">
                    {formatDate(podcast.createdAt)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {podcast.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{formatDuration(podcast.duration)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <span>{new Date(podcast.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-muted-foreground" />
                    <span>1.2K views</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button>Play Now</Button>
                  <Button variant="outline">Add to Playlist</Button>
                  <Button variant="outline">Download</Button>
                </div>
              </div>
            </div>
            
            <AudioPlayer
              audioSrc={podcast.mediaUrl}
              title={podcast.title}
              author={professor?.fullName || "Unknown Professor"}
              thumbnailUrl={podcast.thumbnailUrl}
              podcastId={podcast.id}
              isLiked={isLiked}
            />
          </div>
        )}
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">About this episode</h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {podcast.description || "No description provided."}
            </p>
          </div>
          
          <CommentSection podcastId={podcast.id} />
        </div>
        
        <div>
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Educator</h2>
            
            <div className="flex items-center gap-4 mb-4">
              {professor?.avatarUrl ? (
                <img 
                  src={professor.avatarUrl} 
                  alt={professor.fullName} 
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                  <UserIcon className="h-8 w-8" />
                </div>
              )}
              
              <div>
                <Link href={`/professor/${podcast.professorId}`}>
                  <a className="font-medium hover:text-primary">
                    {professor?.fullName || "Unknown Professor"}
                  </a>
                </Link>
                <p className="text-sm text-muted-foreground">Professor</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {professor?.bio || "No educator bio available."}
            </p>
            
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/professor/${podcast.professorId}`}>
                <a>View Educator Profile</a>
              </Link>
            </Button>
          </div>
          
          {podcast.transcript && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Transcript</h2>
              <div className="max-h-96 overflow-y-auto custom-scrollbar text-sm text-muted-foreground">
                {podcast.transcript}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

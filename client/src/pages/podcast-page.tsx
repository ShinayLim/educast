import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PodcastDetails } from "@/components/podcast/podcast-details";
import { Podcast, User } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function PodcastPage() {
  const { id } = useParams();
  const podcastId = parseInt(id);
  const { user } = useAuth();

  // Fetch podcast data
  const { data: podcast, isLoading: isLoadingPodcast } = useQuery<Podcast>({
    queryKey: [`/api/podcasts/${podcastId}`],
  });

  // Fetch professor data
  const { data: professor, isLoading: isLoadingProfessor } = useQuery<User>({
    queryKey: [`/api/users/${podcast?.professorId}`],
    enabled: !!podcast?.professorId,
  });

  // Check if user has liked the podcast
  const { data: likes = [] } = useQuery<any[]>({
    queryKey: [`/api/podcasts/${podcastId}/likes`],
    enabled: !!podcastId,
  });

  const isLiked = likes.some(like => like.userId === user?.id);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header />
        
        <main className="container mx-auto px-4 pb-24 md:px-6">
          {isLoadingPodcast || isLoadingProfessor ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : podcast ? (
            <div className="py-6">
              <PodcastDetails 
                podcast={podcast} 
                professor={professor} 
                isLiked={isLiked}
              />
            </div>
          ) : (
            <div className="py-20 text-center">
              <h2 className="text-2xl font-bold mb-2">Podcast not found</h2>
              <p className="text-muted-foreground">
                The podcast you're looking for doesn't exist or has been removed.
              </p>
            </div>
          )}
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}

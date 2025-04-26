import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PodcastCard } from "@/components/podcast/podcast-card";
import { Podcast, User, Playlist, Like } from "@shared/schema";
import { Loader2, FolderPlus, List, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const createPlaylistSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500, "Description cannot be longer than 500 characters"),
});

export default function LibraryPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Redirect if user is a professor
  useEffect(() => {
    if (user && user.role === "professor") {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Form for creating a new playlist
  const form = useForm<z.infer<typeof createPlaylistSchema>>({
    resolver: zodResolver(createPlaylistSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });
  
  // Fetch playlists
  const { data: playlists = [], isLoading: isLoadingPlaylists } = useQuery<Playlist[]>({
    queryKey: ['/api/playlists'],
    enabled: !!user,
  });
  
  // Fetch liked podcasts
  const { data: likes = [], isLoading: isLoadingLikes } = useQuery<Like[]>({
    queryKey: ['/api/likes'],
    enabled: !!user,
  });
  
  // Fetch all podcasts
  const { data: allPodcasts = [], isLoading: isLoadingPodcasts } = useQuery<Podcast[]>({
    queryKey: ['/api/podcasts'],
    enabled: !!user && likes.length > 0,
  });
  
  // Fetch users (professors)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!user,
  });
  
  // Filter podcasts that are liked by the user
  const likedPodcasts = allPodcasts.filter(podcast => 
    likes.some(like => like.podcastId === podcast.id)
  );
  
  // Create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createPlaylistSchema>) => {
      return apiRequest('POST', '/api/playlists', {
        ...data,
        userId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playlists'] });
      toast({
        title: "Playlist created",
        description: "Your new playlist has been created successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create playlist. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof createPlaylistSchema>) => {
    createPlaylistMutation.mutate(data);
  };
  
  const isLoading = isLoadingPlaylists || isLoadingLikes || isLoadingPodcasts || isLoadingUsers;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header />
        
        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-1">Your Library</h1>
                <p className="text-muted-foreground">
                  Access your playlists and liked content
                </p>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FolderPlus className="mr-2 h-4 w-4" /> New Playlist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Playlist</DialogTitle>
                    <DialogDescription>
                      Create a new playlist to organize your favorite educational content.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Playlist Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="My Study Playlist" />
                            </FormControl>
                            <FormDescription>
                              Give your playlist a descriptive name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="A collection of podcasts about..."
                                className="resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createPlaylistMutation.isPending}
                        >
                          {createPlaylistMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Create Playlist
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-10">
              {/* Playlists Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Your Playlists</h2>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : playlists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {playlists.map(playlist => (
                      <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                        <a className="bg-card border border-border rounded-lg overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                          <div className="bg-primary/10 border-b border-primary/20 aspect-square flex items-center justify-center">
                            <List className="h-16 w-16 text-primary/60" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold mb-2 line-clamp-1">{playlist.title}</h3>
                            {playlist.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {playlist.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(playlist.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </a>
                      </Link>
                    ))}
                    
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <div className="bg-card border border-dashed border-border rounded-lg overflow-hidden transition-all hover:border-primary hover:shadow-lg flex flex-col items-center justify-center h-full aspect-square cursor-pointer p-6">
                          <FolderPlus className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-center font-medium">Create New Playlist</p>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            Organize your favorite educational content
                          </p>
                        </div>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <ListPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No playlists yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first playlist to organize your favorite educational content.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      Create Your First Playlist
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Liked Content Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Liked Content</h2>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : likedPodcasts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {likedPodcasts.map(podcast => (
                      <PodcastCard
                        key={podcast.id}
                        id={podcast.id}
                        title={podcast.title}
                        author={users.find(u => u.id === podcast.professorId)?.fullName || "Unknown"}
                        authorId={podcast.professorId}
                        thumbnailUrl={podcast.thumbnailUrl}
                        duration={podcast.duration}
                        mediaType={podcast.mediaType as "audio" | "video"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <svg className="h-12 w-12 mx-auto mb-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <h3 className="text-xl font-bold mb-2">No liked content</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't liked any podcasts yet. Start exploring and like content to find it here.
                    </p>
                    <Button asChild>
                      <Link href="/browse">
                        Browse Podcasts
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}

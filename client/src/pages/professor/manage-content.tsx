import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Podcast } from "@shared/schema";
import { Loader2, Pencil, Trash2, Upload, Eye, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function ManageContentPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [podcastToDelete, setPodcastToDelete] = useState<number | null>(null);
  
  // Redirect if user is not a professor
  useEffect(() => {
    if (user && user.role !== "professor") {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Fetch professor's podcasts
  const { data: podcasts = [], isLoading } = useQuery<Podcast[]>({
    queryKey: [`/api/professors/${user?.id}/podcasts`],
    enabled: !!user?.id,
  });
  
  // Get recent and popular podcasts
  const recentPodcasts = [...podcasts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const handleDeletePodcast = async () => {
    if (!podcastToDelete) return;
    
    try {
      await apiRequest('DELETE', `/api/podcasts/${podcastToDelete}`);
      queryClient.invalidateQueries({ queryKey: [`/api/professors/${user?.id}/podcasts`] });
      toast({
        title: "Podcast deleted",
        description: "Your podcast has been successfully deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete podcast. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPodcastToDelete(null);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "--:--";
    
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    
    return `${minutes}m`;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header />
        
        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-6">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-1">Manage Content</h1>
                <p className="text-muted-foreground">
                  View, edit and manage your educational content
                </p>
              </div>
              
              <Button asChild>
                <Link href="/professor/upload">
                  <Upload className="mr-2 h-4 w-4" /> Upload New
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-medium text-lg mb-1">Total Content</h3>
                <p className="text-3xl font-bold">{podcasts.length}</p>
                <p className="text-muted-foreground text-sm">Podcasts uploaded</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-medium text-lg mb-1">Total Views</h3>
                <p className="text-3xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "0"
                  )}
                </p>
                <p className="text-muted-foreground text-sm">Content views</p>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-medium text-lg mb-1">Total Engagement</h3>
                <p className="text-3xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    "0"
                  )}
                </p>
                <p className="text-muted-foreground text-sm">Comments & likes</p>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Content</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : podcasts.length > 0 ? (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border grid grid-cols-12 text-xs uppercase font-medium text-muted-foreground">
                      <div className="col-span-5 md:col-span-4">Title</div>
                      <div className="col-span-2 hidden md:block">Type</div>
                      <div className="col-span-3 md:col-span-2">Upload Date</div>
                      <div className="col-span-2 md:col-span-1 text-right">Duration</div>
                      <div className="col-span-2 md:col-span-1 text-right">Views</div>
                      <div className="col-span-2 text-right pr-4">Actions</div>
                    </div>
                    
                    {podcasts.map(podcast => (
                      <div 
                        key={podcast.id} 
                        className="grid grid-cols-12 p-4 hover:bg-muted/40 transition-colors items-center border-b border-border last:border-0"
                      >
                        <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded flex-shrink-0 overflow-hidden">
                            {podcast.thumbnailUrl ? (
                              <img 
                                src={podcast.thumbnailUrl} 
                                alt={podcast.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {podcast.mediaType === 'audio' ? (
                                  <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                                    <line x1="10" y1="2" x2="10" y2="22"></line>
                                    <line x1="14" y1="2" x2="14" y2="22"></line>
                                    <line x1="2" y1="10" x2="22" y2="10"></line>
                                    <line x1="2" y1="14" x2="22" y2="14"></line>
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/podcast/${podcast.id}`} className="hover:text-primary transition-colors truncate block">
                              <h4 className="font-medium truncate">{podcast.title}</h4>
                            </Link>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {podcast.description?.substring(0, 50)}...
                            </p>
                          </div>
                        </div>
                        
                        <div className="col-span-2 hidden md:block">
                          <span className="px-2 py-1 bg-secondary/50 rounded-full text-xs">
                            {podcast.mediaType === 'audio' ? 'Audio' : 'Video'}
                          </span>
                        </div>
                        
                        <div className="col-span-3 md:col-span-2 text-sm text-muted-foreground">
                          {formatDate(podcast.createdAt)}
                        </div>
                        
                        <div className="col-span-2 md:col-span-1 text-sm text-muted-foreground text-right">
                          {formatDuration(podcast.duration)}
                        </div>
                        
                        <div className="col-span-2 md:col-span-1 text-sm text-muted-foreground text-right flex items-center justify-end">
                          <Eye className="h-4 w-4 mr-1" /> 0
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <Link href={`/podcast/${podcast.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setPodcastToDelete(podcast.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Podcast</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this podcast? This action cannot be undone and will remove all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeletePodcast}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No content yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't uploaded any podcasts or videos yet. Start sharing your knowledge today!
                    </p>
                    <Button asChild>
                      <Link href="/professor/upload">Upload Your First Content</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="audio">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : podcasts.filter(p => p.mediaType === 'audio').length > 0 ? (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Same structure as "all" tab but filtered for audio */}
                    {/* Filter podcasts to only show audio content */}
                    {/* Copy the same table structure from above but filter for audio only */}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No audio content</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't uploaded any audio podcasts yet.
                    </p>
                    <Button asChild>
                      <Link href="/professor/upload">Upload Audio Content</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="video">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : podcasts.filter(p => p.mediaType === 'video').length > 0 ? (
                  <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Same structure as "all" tab but filtered for video */}
                    {/* Filter podcasts to only show video content */}
                    {/* Copy the same table structure from above but filter for video only */}
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-bold mb-2">No video content</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't uploaded any video podcasts yet.
                    </p>
                    <Button asChild>
                      <Link href="/professor/upload">Upload Video Content</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}

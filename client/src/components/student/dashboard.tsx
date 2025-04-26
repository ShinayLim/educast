import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Podcast, History, Bookmark, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import PodcastList from "../shared/PodcastList";
import { Link } from "wouter";

export function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");

  // Fetch all podcasts for discovery
  const { data: podcasts = [] } = useQuery({
    queryKey: ["/api/podcasts"],
    queryFn: async () => {
      const response = await fetch("/api/podcasts");
      if (!response.ok) throw new Error("Failed to fetch podcasts");
      return response.json();
    },
  });

  // Fetch student's playlists
  const { data: playlists = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "playlists"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/playlists`);
      if (!response.ok) throw new Error("Failed to fetch playlists");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch recently viewed podcasts
  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "recently-viewed"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/recently-viewed`);
      if (!response.ok) throw new Error("Failed to fetch recently viewed");
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Recent uploads - last 10 podcasts
  const recentUploads = [...podcasts].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 10);

  // Popular podcasts - most viewed
  const popularPodcasts = [...podcasts].sort((a, b) => 
    (b.views?.length || 0) - (a.views?.length || 0)
  ).slice(0, 6);

  return (
    <div className="container py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList>
          <TabsTrigger value="discover" className="flex items-center">
            <Podcast className="mr-2 h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <History className="mr-2 h-4 w-4" />
            Recently Played
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex items-center">
            <Bookmark className="mr-2 h-4 w-4" />
            My Playlists
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover">
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">New Releases</h2>
                <Button variant="outline" asChild>
                  <Link to="/search">
                    <Search className="mr-2 h-4 w-4" />
                    Browse All
                  </Link>
                </Button>
              </div>
              
              <PodcastList 
                podcasts={recentUploads} 
                emptyMessage="No podcasts available yet." 
                variant="default"
              />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Most Popular</h2>
              <PodcastList 
                podcasts={popularPodcasts} 
                emptyMessage="No podcasts available yet." 
                variant="default"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recently Played</h2>
            </div>
            
            {recentlyViewed.length > 0 ? (
              <PodcastList 
                podcasts={recentlyViewed} 
                variant="list"
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No recently played podcasts</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't listened to any podcasts yet. Start exploring our collection!
                  </p>
                  <Button asChild>
                    <Link to="/search">
                      <Search className="mr-2 h-4 w-4" />
                      Browse Podcasts
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="playlists">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Playlists</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Playlist
              </Button>
            </div>
            
            {playlists.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {playlists.map((playlist: any) => (
                  <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{playlist.title}</CardTitle>
                        <CardDescription>
                          {playlist.description || 'No description'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {playlist.items?.length || 0} podcast{playlist.items?.length !== 1 ? 's' : ''}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create playlists to organize your favorite educational content
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Playlist
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
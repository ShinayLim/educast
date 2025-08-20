import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Podcast as Icon,
  History,
  Bookmark,
  Search,
  Loader2,
  FolderPlus,
  MoreVertical,
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import PodcastList from "../shared/PodcastList";
import { Link } from "wouter";
import supabase from "@/lib/supabase";
import { Playlist, PlaylistItem, Podcast } from "@shared/schema";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const createPlaylistSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z
    .string()
    .max(500, "Description cannot be longer than 500 characters"),
});

export function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all podcasts for discovery
  const { data: podcasts = [] } = useQuery({
    queryKey: ["/api/podcasts"],
    queryFn: async () => {
      const response = await fetch("/api/podcasts");
      if (!response.ok) throw new Error("Failed to fetch podcasts");
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });

  // Fetch playlists
  const { data: playlists = [], isLoading: isLoadingPlaylists } = useQuery<
    Playlist[]
  >({
    queryKey: ["/library/playlists"],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });

  console.log("Playlists data:", playlists);

  // Fetch playlist items
  const { data: playlistItemsMap = {} } = useQuery<
    Record<string, PlaylistItem[]>
  >({
    queryKey: ["playlist-items", playlists.map((p) => p.id)],
    queryFn: async () => {
      const itemsByPlaylist: Record<string, PlaylistItem[]> = {};

      for (const playlist of playlists) {
        const { data, error } = await supabase
          .from("playlist_items")
          .select("*")
          .eq("playlist_id", playlist.id)
          .order("order", { ascending: true });

        if (error) throw new Error(error.message);
        itemsByPlaylist[playlist.id] = data ?? [];
      }

      return itemsByPlaylist;
    },
    enabled: playlists.length > 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });

  // Fetch recent podcast views by the user
  const { data: recentlyViewed = [], isLoading: isLoadingRecent } = useQuery<
    Podcast[]
  >({
    queryKey: ["/podcast/recently-viewed", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("podcast_views")
        .select("*")
        .eq("user_id", user.id)
        .limit(6);

      if (error) {
        throw new Error(
          error.message || "Error fetching recently viewed podcasts."
        );
      }

      const podcastData = await Promise.all(
        data.map(async (view) => {
          const { data: podcast, error: podcastError } = await supabase
            .from("podcasts")
            .select("*")
            .eq("id", view.podcast_id)
            .single();

          if (podcastError) {
            console.error(
              `Error fetching podcast ${view.podcast_id}: ${podcastError.message}`
            );
            return null;
          }

          return podcast;
        })
      );

      return podcastData ?? [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });

  // Recent uploads - last 10 podcasts
  const recentUploads = [...podcasts]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  // Popular podcasts - most viewed
  const popularPodcasts = [...podcasts]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  // Form for creating a new playlist
  const form = useForm<z.infer<typeof createPlaylistSchema>>({
    resolver: zodResolver(createPlaylistSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Create playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createPlaylistSchema>) => {
      if (!user?.id) throw new Error("Not logged in");

      const { data: newPlaylist, error } = await supabase
        .from("playlists")
        .insert([
          {
            title: data.title,
            description: data.description,
            user_id: user.id,
          },
        ])
        .select()
        .single(); // returns the inserted row

      if (error) throw new Error(error.message);
      return newPlaylist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/library/playlists"] });
      toast({
        title: "Playlist created",
        description: "Your new playlist has been created successfully.",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: () => {
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

  const handleDeletePlaylist = async (playlist: Playlist) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", playlist.id)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete playlist. Please try again.",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["/library/playlists"] });
      toast({
        title: "Playlist deleted",
        description: `"${playlist.title}" has been deleted sucessfully.`,
      });
    }
  };

  return (
    <div className="container py-8">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList>
          <TabsTrigger value="discover" className="flex items-center">
            <Icon className="mr-2 h-4 w-4" />
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

            {isLoadingRecent ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : recentlyViewed.length > 0 ? (
              <PodcastList
                podcasts={recentlyViewed}
                emptyMessage={"No recently viewed podcasts. Try browsing."}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No recently played podcasts
                  </h3>
                  <p className="text-muted-foreground text-center mb-4">
                    You haven't listened to any podcasts yet. Start exploring
                    our collection!
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
                      Create a new playlist to organize your favorite
                      educational content.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Playlist Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="My Study Playlist"
                              />
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

            {isLoadingPlaylists ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : playlists.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {playlists.map((playlist: any) => (
                  <div key={playlist.id}>
                    <Card className="relative cursor-pointer transition-all hover:shadow-xl">
                      {/* Three dots button fixed in top-right */}
                      <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={handleDeletePlaylist.bind(
                                null,
                                playlist
                              )}
                            >
                              Delete Playlist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Make the whole card clickable via Link */}
                      <Link href={`/playlist/${playlist.id}`}>
                        <CardHeader>
                          <CardTitle>{playlist.title}</CardTitle>
                          <CardDescription>
                            {playlist.description || "No description"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {(playlistItemsMap[playlist.id] ?? []).length}{" "}
                            podcast
                            {(playlistItemsMap[playlist.id] ?? []).length !== 1
                              ? "s"
                              : ""}
                          </p>
                        </CardContent>
                      </Link>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create playlists to organize your favorite educational
                    content
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

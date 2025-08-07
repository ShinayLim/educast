import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Playlist, PlaylistItem, Podcast, User } from "@shared/schema";
import {
  Loader2,
  Clock,
  Play,
  MoreVertical,
  Music,
  List,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function PlaylistPage() {
  const { id } = useParams();
  const playlistId = parseInt(id);
  const { toast } = useToast();
  const { user } = useAuth();
  const [podcastToDelete, setPodcastToDelete] = useState<number | null>(null);

  // Fetch playlist data
  const { data: playlist, isLoading: isLoadingPlaylist } = useQuery<Playlist>({
    queryKey: [`/api/playlists/${playlistId}`],
  });

  // Fetch playlist items
  const { data: playlistItems = [], isLoading: isLoadingItems } = useQuery<
    PlaylistItem[]
  >({
    queryKey: [`/api/playlists/${playlistId}/items`],
    enabled: !!playlistId,
  });

  // Fetch podcast data for all items
  const { data: podcasts = [], isLoading: isLoadingPodcasts } = useQuery<
    Podcast[]
  >({
    queryKey: ["/api/podcasts"],
    enabled: playlistItems.length > 0,
  });

  // Filter podcasts that are in the playlist
  const playlistPodcasts = playlistItems
    .map((item) => {
      const podcast = podcasts.find((p) => p.id === item.podcastId);
      return {
        ...item,
        podcast,
      };
    })
    .filter((item) => item.podcast)
    .sort((a, b) => a.order - b.order);

  const handleDeleteFromPlaylist = async () => {
    if (!podcastToDelete) return;

    try {
      const itemToDelete = playlistItems.find(
        (item) => item.podcastId === podcastToDelete
      );
      if (itemToDelete) {
        await apiRequest("DELETE", `/api/playlist-items/${itemToDelete.id}`);
        queryClient.invalidateQueries({
          queryKey: [`/api/playlists/${playlistId}/items`],
        });
        toast({
          title: "Removed from playlist",
          description: "The podcast has been removed from your playlist.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPodcastToDelete(null);
    }
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return "--:--";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const isLoading = isLoadingPlaylist || isLoadingItems || isLoadingPodcasts;

  const totalDuration = playlistPodcasts.reduce((total, item) => {
    return total + (item.podcast?.duration || 0);
  }, 0);

  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="container mx-auto px-4 pb-24 md:px-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : playlist ? (
            <div className="py-6">
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-64 flex-shrink-0">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg aspect-square flex items-center justify-center">
                    <List className="h-24 w-24 text-primary/60" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-6">
                    <h4 className="uppercase text-sm font-medium text-primary tracking-wide">
                      Playlist
                    </h4>
                    <h1 className="text-4xl font-bold mt-2 mb-2">
                      {playlist.title}
                    </h1>

                    <div className="text-muted-foreground">
                      {playlist.description && (
                        <p className="mb-3">{playlist.description}</p>
                      )}
                      <div className="flex items-center text-sm">
                        <span className="font-medium">{user?.fullName}</span>
                        <span className="mx-2">•</span>
                        <span>{playlistPodcasts.length} podcasts</span>
                        <span className="mx-2">•</span>
                        <span>{formatTotalDuration(totalDuration)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button className="gap-2 rounded-full">
                      <Play className="h-4 w-4" /> Play All
                    </Button>
                  </div>
                </div>
              </div>

              {playlistPodcasts.length > 0 ? (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="p-4 border-b border-border grid grid-cols-12 text-xs uppercase font-medium text-muted-foreground">
                    <div className="col-span-1 flex items-center justify-center">
                      #
                    </div>
                    <div className="col-span-6 md:col-span-5">Title</div>
                    <div className="col-span-3 hidden md:block">Date added</div>
                    <div className="col-span-4 md:col-span-2 flex items-center justify-end pr-4">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>

                  {playlistPodcasts.map((item, index) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 p-2 hover:bg-muted/40 transition-colors items-center border-b border-border last:border-0"
                    >
                      <div className="col-span-1 flex items-center justify-center text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded flex-shrink-0 overflow-hidden">
                          {item.podcast?.thumbnailUrl ? (
                            <img
                              src={item.podcast.thumbnailUrl}
                              alt={item.podcast.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {item.podcast?.mediaType === "audio" ? (
                                <Headphones className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Music className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/player/${item.podcast?.id}`}
                            className="hover:text-primary transition-colors truncate block"
                          >
                            <h4 className="font-medium truncate">
                              {item.podcast?.title}
                            </h4>
                          </Link>
                          {item.podcast?.professorName && (
                            <Link
                              href={`/professor/${item.podcast?.professorId}`}
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate block"
                            >
                              {item.podcast?.professorName}
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="col-span-3 hidden md:block text-muted-foreground text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-4 text-muted-foreground">
                        <span className="text-sm">
                          {formatDuration(item.podcast?.duration)}
                        </span>

                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/player/${item.podcast?.id}`}>
                                  Go to podcast
                                </Link>
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setPodcastToDelete(item.podcast?.id || null)
                                  }
                                >
                                  Remove from playlist
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove from playlist?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the podcast from this playlist.
                                You can always add it back later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteFromPlaylist}
                              >
                                Remove
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
                  <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-bold mb-2">
                    This playlist is empty
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start adding podcasts to your playlist
                  </p>
                  <Button asChild>
                    <Link href="/browse">Browse Podcasts</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center">
              <h2 className="text-2xl font-bold mb-2">Playlist not found</h2>
              <p className="text-muted-foreground">
                The playlist you're looking for doesn't exist or has been
                removed.
              </p>
            </div>
          )}
        </main>

        <MobileNav />
      </div>
    </div>
  );
}

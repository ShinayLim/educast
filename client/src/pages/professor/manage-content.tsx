import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Podcast } from "@shared/schema";
import { Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import supabase from "@/lib/supabase";
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

export default function ManageContentPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [podcastToDelete, setPodcastToDelete] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== "professor") {
      navigate("/");
    }
  }, [user, navigate]);

  const { data: podcasts = [], isLoading } = useQuery<Podcast[]>({
    queryKey: [`/podcasts/professor/${user?.id}`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("professorId", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message || "Failed to fetch podcasts");
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleDeletePodcast = async () => {
    if (!podcastToDelete) return;

    try {
      const { error } = await supabase
        .from("podcasts")
        .delete()
        .eq("id", podcastToDelete);

      if (error) {
        throw new Error(error.message || "Failed to delete podcast");
      }

      queryClient.invalidateQueries({
        queryKey: [`/podcasts/professor/${user?.id}`],
      });
      toast({
        title: "Podcast deleted",
        description: "Your podcast has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete podcast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPodcastToDelete(null);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredAudio = podcasts.filter(
    (p) => p.mediaType?.toLowerCase() === "audio"
  );
  const filteredVideo = podcasts.filter(
    (p) => p.mediaType?.toLowerCase() === "video"
  );

  const renderPodcastTable = (list: Podcast[]) => (
    <table className="w-full text-left border border-border rounded">
      <thead className="bg-muted">
        <tr>
          <th className="p-3">Title</th>
          <th className="p-3">Type</th>
          <th className="p-3">Created</th>
          <th className="p-3">Views</th>
          <th className="p-3">Comments</th>
          <th className="p-3 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {list.map((podcast) => (
          <tr key={podcast.id} className="border-t border-border">
            <td className="p-3">{podcast.title}</td>
            <td className="p-3 capitalize">{podcast.mediaType}</td>
            <td className="p-3">{formatDate(podcast.created_at)}</td>
            <td className="p-3 ">
              <PodcastViews podcastId={podcast.id} />
            </td>
            <td className="p-3">
              <PodcastCommentCount podcastId={podcast.id} />
            </td>
            <td className="p-3 text-center space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/professor/edit/${podcast.id}`}>
                  <Pencil className="w-4 h-4" />
                  Edit
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setPodcastToDelete(podcast.id as number)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm delete</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this podcast?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePodcast}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
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
                  renderPodcastTable(podcasts)
                ) : (
                  <EmptyState message="No content yet" />
                )}
              </TabsContent>

              <TabsContent value="audio">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : filteredAudio.length > 0 ? (
                  renderPodcastTable(filteredAudio)
                ) : (
                  <EmptyState message="No audio content" />
                )}
              </TabsContent>

              <TabsContent value="video">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                ) : filteredVideo.length > 0 ? (
                  renderPodcastTable(filteredVideo)
                ) : (
                  <EmptyState message="No video content" />
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 text-center">
      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-bold mb-2">{message}</h3>
      <p className="text-muted-foreground mb-6">
        You haven't uploaded any content yet.
      </p>
      <Button asChild>
        <Link href="/professor/upload">Upload Content</Link>
      </Button>
    </div>
  );
}

function PodcastViews({ podcastId }: { podcastId: number }) {
  const { data, isLoading } = useQuery<number>({
    queryKey: [`/podcasts/${podcastId}/views`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("views")
        .eq("id", podcastId)
        .single();

      if (error) {
        console.error("Error fetching views:", error);
        return 0;
      }

      return data?.views ?? 0;
    },
  });

  if (isLoading) return <span>Loading...</span>;
  return <span>{data} views</span>;
}

function PodcastCommentCount({ podcastId }: { podcastId: number }) {
  const { data, isLoading } = useQuery<number>({
    queryKey: [`/podcasts/${podcastId}/comments-count`],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("podcasts_comments")
        .select("id", { count: "exact", head: true })
        .eq("podcast_id", podcastId);

      if (error) {
        console.error("Error fetching comment count:", error);
        return 0;
      }

      return count ?? 0;
    },
  });

  if (isLoading) return <span>Loading...</span>;
  return <span>{data} comments</span>;
}

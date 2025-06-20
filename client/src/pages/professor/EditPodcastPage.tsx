import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditPodcastPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== "professor") {
      navigate("/");
    }
  }, [user, navigate]);

  const { data: podcast, isLoading } = useQuery({
    queryKey: [`/podcast/${id}`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message || "Failed to fetch podcast");
      }

      return data;
    },
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: [`/professor/podcast/${id}/comments`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts_comments")
        .select(
          `
        id,
        comment,
        created_at,
        user_id,
        parent_id,
        student_name,
        likes,
        dislikes
      `
        )
        .eq("podcast_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(error.message || "Failed to fetch comments");
      }

      return data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from("podcasts")
        .update(updates)
        .eq("id", id);

      if (error) {
        throw new Error(error.message || "Failed to update podcast");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/podcast/${id}`] });
      toast({
        title: "Podcast updated",
        description: "Your podcast has been updated.",
      });
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtube_url: "",
    tags: "",
  });

  useEffect(() => {
    if (podcast) {
      setFormData({
        title: podcast.title || "",
        description: podcast.description || "",
        youtube_url: podcast.youtube_url || "",
        tags: podcast.tags?.join(", ") || "",
      });
    }
  }, [podcast]);

  const handleSave = () => {
    updateMutation.mutate({
      title: formData.title,
      description: formData.description,
      youtube_url: formData.youtube_url,
      tags: formData.tags.split(",").map((t) => t.trim()),
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-6 space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Edit Podcast</h1>
              <Button variant="outline" asChild>
                <Link href="/professor/manage">← Back to Manage Content</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : podcast ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Title
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      YouTube URL
                    </label>
                    <Input
                      value={formData.youtube_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          youtube_url: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Tags (comma separated)
                    </label>
                    <Input
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>

                <hr className="my-8" />

                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Comments ({comments.length})
                  </h2>
                  {commentsLoading ? (
                    <p>Loading comments...</p>
                  ) : comments.length === 0 ? (
                    <p className="text-muted-foreground">No comments yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment: any) => (
                        <div
                          key={comment.id}
                          className="border border-border rounded p-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">
                              {comment.student_name || comment.user_id}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString()}
                            </div>
                          </div>
                          <div className="mb-2">{comment.comment}</div>
                          <div className="text-sm text-muted-foreground">
                            👍 {comment.likes || 0} | 👎 {comment.dislikes || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p>Podcast not found.</p>
            )}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

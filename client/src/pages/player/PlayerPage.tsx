// client/src/pages/player/PlayerPage.tsx
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useState } from "react";
import ReactPlayer from "react-player";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";

export default function PlayerPage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: podcast, isLoading } = useQuery({
    queryKey: [`/player/${id}`],
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

  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: [`/player/${id}/comments`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts_comments")
        .select(
          `
        *,
        profiles ( full_name, username )
      `
        )
        .eq("podcast_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message || "Failed to fetch comments");
      }

      return data;
    },
    enabled: !!id,
  });

  const commentMutation = useMutation({
    mutationFn: async (comment: string) => {
      const { error } = await supabase.from("podcasts_comments").insert([
        {
          podcast_id: id,
          user_id: user?.id,
          comment,
        },
      ]);

      if (error) {
        throw new Error(error.message || "Failed to post comment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/player/${id}/comments`] });
      setNewComment("");
    },
  });

  const likeVideoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("increment_video_like", {
        podcast_row_id: id,
      });
      if (error) {
        throw new Error(error.message || "Failed to like video");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/player/${id}`] });
    },
  });

  const dislikeVideoMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("increment_video_dislike", {
        podcast_row_id: id,
      });
      if (error) {
        throw new Error(error.message || "Failed to dislike video");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/player/${id}`] });
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.rpc("increment_like", {
        row_id: commentId,
      });
      if (error) {
        throw new Error(error.message || "Failed to like comment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/player/${id}/comments`] });
    },
  });

  const dislikeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase.rpc("increment_dislike", {
        row_id: commentId,
      });
      if (error) {
        throw new Error(error.message || "Failed to dislike comment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/player/${id}/comments`] });
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: async ({
      commentId,
      newContent,
    }: {
      commentId: string;
      newContent: string;
    }) => {
      const { error } = await supabase
        .from("podcasts_comments")
        .update({ comment: newContent, updated_at: new Date().toISOString() })
        .eq("id", commentId);

      if (error) {
        throw new Error(error.message || "Failed to edit comment");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/player/${id}/comments`] });
      setEditingCommentId(null);
      setEditingContent("");
    },
  });

  const [playing, setPlaying] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const getYoutubeUrl = (url: string | null | undefined) => {
    if (!url) return "";
    return url;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : podcast ? (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold">{podcast.title}</h1>
                <p className="text-muted-foreground">{podcast.description}</p>

                {/* Like/Dislike video */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => likeVideoMutation.mutate()}
                  >
                    👍 Like ({podcast.likes || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dislikeVideoMutation.mutate()}
                  >
                    👎 Dislike ({podcast.dislikes || 0})
                  </Button>
                </div>

                <div className="rounded border border-border overflow-hidden">
                  <ReactPlayer
                    url={getYoutubeUrl(podcast.youtube_url)}
                    controls
                    playing={playing}
                    width="100%"
                    height="480px"
                  />
                </div>

                {/* Add comment */}
                <div className="mt-8 space-y-4">
                  <h3 className="text-xl font-bold">Comments</h3>

                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />

                  <Button
                    onClick={() => commentMutation.mutate(newComment)}
                    disabled={
                      !newComment.trim() || commentMutation.status === "pending"
                    }
                  >
                    {commentMutation.status === "pending"
                      ? "Posting..."
                      : "Post Comment"}
                  </Button>

                  {/* Comments List */}
                  {loadingComments ? (
                    <div className="text-center py-4">Loading comments...</div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 border rounded space-y-2 bg-muted"
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-medium">
                              <p className="font-medium">
                                {c.user_id === user?.id
                                  ? "You"
                                  : c.profiles?.full_name ||
                                    c.profiles?.username ||
                                    "Unknown User"}
                              </p>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(c.created_at).toLocaleString()}
                            </p>
                          </div>

                          {editingCommentId === c.id ? (
                            <>
                              <Textarea
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                              />
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    editCommentMutation.mutate({
                                      commentId: c.id,
                                      newContent: editingContent,
                                    })
                                  }
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingCommentId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p>{c.comment}</p>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    likeCommentMutation.mutate(c.id)
                                  }
                                >
                                  👍 {c.likes}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    dislikeCommentMutation.mutate(c.id)
                                  }
                                >
                                  👎 {c.dislikes}
                                </Button>
                                {c.user_id === user?.id && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingCommentId(c.id);
                                      setEditingContent(c.comment);
                                    }}
                                  >
                                    ✏️ Edit
                                  </Button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No comments yet.</p>
                  )}
                </div>

                <Button variant="outline" onClick={() => navigate("/")}>
                  ← Back to Dashboard
                </Button>
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-bold mb-4">Podcast not found</h3>
                <Button variant="outline" onClick={() => navigate("/")}>
                  ← Back to Dashboard
                </Button>
              </div>
            )}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Comment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2 } from "lucide-react";

interface CommentSectionProps {
  podcastId: number;
}

export default function CommentSection({ podcastId }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  
  // Fetch comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: [`/api/podcasts/${podcastId}/comments`],
  });
  
  // Post comment
  const commentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/comments", {
        content: commentText,
        podcastId,
      });
      return await res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: [`/api/podcasts/${podcastId}/comments`] });
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to post comment",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  // Delete comment
  const deleteMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
      return commentId;
    },
    onSuccess: (commentId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/podcasts/${podcastId}/comments`] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete comment",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate();
  };
  
  const handleDelete = (commentId: number) => {
    deleteMutation.mutate(commentId);
  };
  
  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      
      {user && (
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={user.avatarUrl || ""} alt={user.displayName} />
            <AvatarFallback>
              {user.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="resize-none"
            />
          </div>
          <Button 
            type="submit" 
            size="icon"
            disabled={!commentText.trim() || commentMutation.isPending}
          >
            {commentMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      )}
      
      {isLoadingComments ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>
                  {/* Placeholder - in a real app, you'd fetch user details or include them in the comment */}
                  {comment.userId.toString().charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">User {comment.userId}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
              {user && user.id === comment.userId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && deleteMutation.variables === comment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

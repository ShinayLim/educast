import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Trash, MessageSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentSectionProps {
  podcastId: number;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  podcastId: number;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
}

interface CommentWithUser extends Comment {
  user?: User;
}

export default function CommentSection({ podcastId }: CommentSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  // Fetch comments
  const { data: comments = [] } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/podcasts", podcastId, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/podcasts/${podcastId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const comments = await response.json();
      
      // Fetch user data for each comment
      const usersMap = new Map<number, User>();
      const uniqueUserIds = [...new Set(comments.map((c: Comment) => c.userId))];
      
      for (const userId of uniqueUserIds) {
        try {
          const userResponse = await fetch(`/api/users/${userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            usersMap.set(userId, userData);
          }
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
        }
      }
      
      // Combine comments with user data
      return comments.map((comment: Comment) => ({
        ...comment,
        user: usersMap.get(comment.userId),
      }));
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/podcasts/${podcastId}/comments`, {
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts", podcastId, "comments"] });
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts", podcastId, "comments"] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add a comment.",
        variant: "destructive",
      });
      return;
    }
    
    addCommentMutation.mutate(commentText);
  };

  const handleDeleteComment = (comment: Comment) => {
    setCommentToDelete(comment);
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete.id);
      setCommentToDelete(null);
    }
  };

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments.length})
      </h3>
      
      {user ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitComment} 
              disabled={!commentText.trim() || addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded-md bg-secondary/50 text-center">
          <p className="text-sm text-muted-foreground">
            Please log in to add a comment.
          </p>
        </div>
      )}
      
      {comments.length === 0 ? (
        <div className="p-4 border rounded-md text-center">
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded-md">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  {comment.user?.avatarUrl ? (
                    <AvatarImage src={comment.user.avatarUrl} alt={comment.user.fullName} />
                  ) : (
                    <AvatarFallback>
                      {comment.user ? getInitials(comment.user.fullName) : "??"}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {comment.user?.fullName || "Unknown User"}
                        {comment.user?.role === "professor" && (
                          <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                            Professor
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                    
                    {(user?.id === comment.userId || user?.role === "professor") && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteComment(comment)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="mt-2 text-sm whitespace-pre-line">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteComment}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
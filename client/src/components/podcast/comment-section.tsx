import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Comment, User } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";
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

interface CommentSectionProps {
  podcastId: number;
}

interface CommentWithUser extends Comment {
  user?: User;
}

export function CommentSection({ podcastId }: CommentSectionProps) {
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch comments
  const { 
    data: comments = [], 
    isLoading: isLoadingComments 
  } = useQuery<CommentWithUser[]>({
    queryKey: [`/api/podcasts/${podcastId}/comments`],
  });
  
  // Fetch users for comments
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: comments.length > 0,
  });
  
  // Add user data to comments
  const commentsWithUsers = comments.map(comment => {
    const commentUser = users.find(u => u.id === comment.userId);
    return {
      ...comment,
      user: commentUser
    };
  });
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', `/api/podcasts/${podcastId}/comments`, { content });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/podcasts/${podcastId}/comments`] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return apiRequest('DELETE', `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/podcasts/${podcastId}/comments`] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    addCommentMutation.mutate(comment);
  };
  
  const handleDeleteComment = (commentId: number) => {
    deleteCommentMutation.mutate(commentId);
  };
  
  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Discussion</h2>
      
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <Textarea
            placeholder="Add a comment..."
            className="mb-2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button 
            type="submit" 
            disabled={!comment.trim() || addCommentMutation.isPending}
          >
            {addCommentMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Post Comment
          </Button>
        </form>
      ) : (
        <div className="bg-muted p-4 rounded-lg mb-8 text-center">
          Please login to add a comment.
        </div>
      )}
      
      <div className="space-y-6">
        {isLoadingComments ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : commentsWithUsers.length > 0 ? (
          commentsWithUsers.map((comment) => (
            <div key={comment.id} className="pb-6 border-b border-border last:border-0">
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  {comment.user?.avatarUrl ? (
                    <img 
                      src={comment.user.avatarUrl} 
                      alt={comment.user.fullName} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      {comment.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">
                      {comment.user?.fullName || "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
                
                {user?.id === comment.userId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </AlertDialogTrigger>
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
                          onClick={() => handleDeleteComment(comment.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteCommentMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              <p className="text-muted-foreground pl-10">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}

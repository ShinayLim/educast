import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Play, Heart, MessageSquare, Eye, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
import { useState } from "react";

// Define a simplified Podcast type for our component
interface PodcastItem {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  mediaUrl: string;
  professorId: number;
  createdAt: string | null;
  views?: any[];
  likes?: any[];
  comments?: any[];
}

interface PodcastListProps {
  podcasts: PodcastItem[];
  emptyMessage?: string;
  variant?: "default" | "compact" | "list";
  showActions?: boolean;
  onPlay?: (podcast: PodcastItem) => void;
}

export default function PodcastList({ 
  podcasts, 
  emptyMessage = "No podcasts found.", 
  variant = "default",
  showActions = false,
  onPlay,
}: PodcastListProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [podcastToDelete, setPodcastToDelete] = useState<PodcastItem | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/podcasts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/professors", user?.id, "podcasts"] });
      
      toast({
        title: "Podcast deleted",
        description: "The podcast has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete podcast",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (podcast: PodcastItem) => {
    setPodcastToDelete(podcast);
  };

  const confirmDelete = () => {
    if (podcastToDelete) {
      deleteMutation.mutate(podcastToDelete.id);
      setPodcastToDelete(null);
    }
  };

  const handlePlay = (podcast: PodcastItem) => {
    if (onPlay) {
      onPlay(podcast);
    } else {
      // Navigate to podcast page
      window.location.href = `/podcasts/${podcast.id}`;
    }
  };

  if (podcasts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        {podcasts.map((podcast) => (
          <div 
            key={podcast.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                {podcast.thumbnailUrl ? (
                  <img 
                    src={podcast.thumbnailUrl} 
                    alt={podcast.title} 
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">{podcast.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {podcast.createdAt ? formatDistanceToNow(new Date(podcast.createdAt), { addSuffix: true }) : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                <span>{podcast.views?.length || 0}</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                <span>{podcast.likes?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-4">
        {podcasts.map((podcast) => (
          <div 
            key={podcast.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center">
                {podcast.thumbnailUrl ? (
                  <img 
                    src={podcast.thumbnailUrl} 
                    alt={podcast.title} 
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </div>
              <div>
                <h4 className="font-medium">{podcast.title}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {podcast.description}
                </p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                  <span>{podcast.createdAt ? formatDistanceToNow(new Date(podcast.createdAt), { addSuffix: true }) : ""}</span>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    <span>{podcast.views?.length || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    <span>{podcast.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>{podcast.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handlePlay(podcast)}
              >
                <Play className="h-4 w-4" />
              </Button>
              
              {showActions && podcast.professorId === user?.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/podcasts/${podcast.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(podcast)}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
        
        <AlertDialog open={!!podcastToDelete} onOpenChange={(open) => !open && setPodcastToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the podcast "{podcastToDelete?.title}". 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
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

  // Default card view
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {podcasts.map((podcast) => (
        <Card key={podcast.id}>
          <CardHeader>
            <div className="aspect-video w-full rounded-md bg-secondary mb-4 overflow-hidden">
              {podcast.thumbnailUrl ? (
                <img 
                  src={podcast.thumbnailUrl} 
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="h-10 w-10" />
                </div>
              )}
            </div>
            <CardTitle>{podcast.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{podcast.description}</p>
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{podcast.views?.length || 0}</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>{podcast.likes?.length || 0}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{podcast.comments?.length || 0}</span>
                </div>
              </div>
              <span>{podcast.createdAt ? formatDistanceToNow(new Date(podcast.createdAt), { addSuffix: true }) : ""}</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => handlePlay(podcast)}>
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
            
            {showActions && podcast.professorId === user?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/podcasts/${podcast.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(podcast)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
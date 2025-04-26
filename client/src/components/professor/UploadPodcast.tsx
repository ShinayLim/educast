import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertPodcastSchema } from "@shared/schema";

// Upload validation schema
const uploadPodcastSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  tags: z.string().optional(),
});

type UploadPodcastFormValues = z.infer<typeof uploadPodcastSchema>;

export default function UploadPodcast() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Form setup
  const form = useForm<UploadPodcastFormValues>({
    resolver: zodResolver(uploadPodcastSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  // Upload media file mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/podcasts", undefined, {
        body: formData,
        // Don't set Content-Type header when sending FormData
        headers: {},
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      toast({
        title: "Podcast uploaded successfully",
        description: "Your podcast is now available to students.",
      });
      form.reset();
      setMediaFile(null);
      setThumbnailFile(null);
      setMediaPreview(null);
      setThumbnailPreview(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload thumbnail mutation (for after podcast is created)
  const uploadThumbnailMutation = useMutation({
    mutationFn: async (data: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append("thumbnail", data.file);
      
      const response = await apiRequest("POST", `/api/podcasts/${data.id}/thumbnail`, undefined, {
        body: formData,
        headers: {},
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Thumbnail upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      
      // Create URL for preview if it's a video
      if (file.type.startsWith("video/")) {
        setMediaPreview(URL.createObjectURL(file));
      } else {
        setMediaPreview(null);
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: UploadPodcastFormValues) => {
    if (!mediaFile) {
      toast({
        title: "Media file required",
        description: "Please select an audio or video file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("media", mediaFile);
    
    // Append tags if provided
    if (data.tags) {
      try {
        // Convert comma-separated tags to an array
        const tagsArray = data.tags.split(",").map(tag => tag.trim()).filter(Boolean);
        formData.append("tags", JSON.stringify(tagsArray));
      } catch (error) {
        console.error("Error parsing tags:", error);
      }
    }

    try {
      // First upload the podcast with the media file
      const podcast = await uploadMediaMutation.mutateAsync(formData);
      
      // Then upload the thumbnail if one was provided
      if (thumbnailFile && podcast.id) {
        await uploadThumbnailMutation.mutateAsync({
          id: podcast.id,
          file: thumbnailFile,
        });
      }
    } catch (error) {
      console.error("Error in upload process:", error);
    }
  };

  const isPending = uploadMediaMutation.isPending || uploadThumbnailMutation.isPending;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Upload New Podcast</CardTitle>
        <CardDescription>
          Share your knowledge with students by uploading audio or video content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduction to Psychology" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive title for your podcast.
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a detailed description of your podcast content..." 
                      className="h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what students will learn from this podcast.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="psychology, introduction, beginner" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated tags to help categorize your podcast.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="media">Media File (Audio/Video)</Label>
                <div className="border rounded-md p-2">
                  <Input 
                    id="media" 
                    type="file" 
                    accept="audio/*,video/*" 
                    onChange={handleMediaChange}
                    disabled={isPending}
                  />
                </div>
                {mediaPreview && (
                  <div className="mt-2">
                    <video 
                      src={mediaPreview} 
                      controls 
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                )}
                {mediaFile && !mediaPreview && (
                  <div className="mt-2 p-3 bg-secondary rounded-md flex items-center gap-2">
                    <span className="text-sm font-medium">{mediaFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(mediaFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
                <div className="border rounded-md p-2">
                  <Input 
                    id="thumbnail" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleThumbnailChange}
                    disabled={isPending}
                  />
                </div>
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-auto max-h-32 object-contain rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <CardFooter className="px-0 pt-4">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Podcast
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
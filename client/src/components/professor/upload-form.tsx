import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Upload, FileAudio, FileVideo, X, Check, Headphones, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Define the schema for podcast upload form
const uploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  mediaType: z.enum(["audio", "video"], {
    required_error: "You must select a media type",
  }),
  tags: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export function UploadForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<File | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize the form
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      mediaType: "audio",
      tags: "",
    },
  });
  
  // Track the selected media type
  const mediaType = form.watch("mediaType");
  
  // Handle media file selection
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const mediaType = form.getValues("mediaType");
    
    // Check if the file type matches the selected media type
    if (mediaType === "audio" && !file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    if (mediaType === "video" && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, WebM, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 100MB",
        variant: "destructive",
      });
      return;
    }
    
    setUploadedMedia(file);
  };
  
  // Handle thumbnail file selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a thumbnail smaller than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setUploadedThumbnail(file);
    
    // Create a preview URL for the thumbnail
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Clear selected media file
  const clearMedia = () => {
    setUploadedMedia(null);
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };
  
  // Clear selected thumbnail
  const clearThumbnail = () => {
    setUploadedThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };
  
  // Simulate upload progress (in a real app, this would come from the actual upload)
  const simulateProgress = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 300);
    
    return () => clearInterval(interval);
  };
  
  // Upload podcast mutation
  const uploadPodcastMutation = useMutation({
    mutationFn: async (data: UploadFormValues) => {
      if (!uploadedMedia) {
        throw new Error("Please select a media file");
      }
      
      // In a real implementation, this would be a proper multipart form upload
      // For now, we'll simulate the upload and API call
      simulateProgress();
      
      // Create FormData for uploading files
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("mediaType", data.mediaType);
      formData.append("media", uploadedMedia);
      
      if (data.tags) {
        formData.append("tags", JSON.stringify(data.tags.split(',').map(tag => tag.trim())));
      }
      
      // Make the API request to upload the podcast
      const response = await apiRequest("POST", "/api/podcasts", formData);
      const podcast = await response.json();
      
      // If a thumbnail was uploaded, make a separate request to add it
      if (uploadedThumbnail) {
        const thumbnailFormData = new FormData();
        thumbnailFormData.append("thumbnail", uploadedThumbnail);
        
        await apiRequest("POST", `/api/podcasts/${podcast.id}/thumbnail`, thumbnailFormData);
      }
      
      // Complete the progress
      setUploadProgress(100);
      
      return podcast;
    },
    onSuccess: (podcast) => {
      // Reset form and state
      form.reset();
      setUploadedMedia(null);
      setUploadedThumbnail(null);
      setThumbnailPreview(null);
      setIsUploading(false);
      setUploadProgress(0);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/professors/${user?.id}/podcasts`] });
      
      // Show success toast
      toast({
        title: "Upload successful",
        description: "Your podcast has been uploaded successfully.",
      });
      
      // Navigate to the manage content page
      setTimeout(() => {
        navigate("/professor/manage");
      }, 1500);
    },
    onError: (error) => {
      setIsUploading(false);
      setUploadProgress(0);
      
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: UploadFormValues) => {
    if (!uploadedMedia) {
      toast({
        title: "Media file required",
        description: `Please select a ${data.mediaType} file to upload.`,
        variant: "destructive",
      });
      return;
    }
    
    uploadPodcastMutation.mutate(data);
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="content">Content Details</TabsTrigger>
              <TabsTrigger value="media">Media Files</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-6">
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
                      The title of your educational podcast
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
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe what students will learn from this content
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
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="psychology, introduction, mental health" {...field} />
                    </FormControl>
                    <FormDescription>
                      Comma-separated tags to help students find your content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mediaType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Media Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="audio" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center">
                            <Headphones className="mr-2 h-4 w-4" /> Audio Podcast
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="video" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center">
                            <Video className="mr-2 h-4 w-4" /> Video Lecture
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Select the type of content you are uploading
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="media" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload {mediaType === "audio" ? "Audio" : "Video"} File</CardTitle>
                  <CardDescription>
                    Select the {mediaType === "audio" ? "audio" : "video"} file you want to upload
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!uploadedMedia ? (
                    <div
                      className="border-2 border-dashed border-primary/50 rounded-lg p-12 text-center hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() => mediaInputRef.current?.click()}
                    >
                      {mediaType === "audio" ? (
                        <FileAudio className="w-16 h-16 mx-auto mb-4 text-primary/70" />
                      ) : (
                        <FileVideo className="w-16 h-16 mx-auto mb-4 text-primary/70" />
                      )}
                      <h3 className="text-lg font-medium mb-2">
                        Drop your {mediaType} file here or click to browse
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Supported formats: {mediaType === "audio" ? "MP3, WAV, AAC, OGG" : "MP4, WebM, MOV"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Maximum file size: 100MB
                      </p>
                      <input
                        type="file"
                        ref={mediaInputRef}
                        className="hidden"
                        accept={mediaType === "audio" ? "audio/*" : "video/*"}
                        onChange={handleMediaChange}
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {mediaType === "audio" ? (
                            <FileAudio className="w-10 h-10 mr-4 text-primary" />
                          ) : (
                            <FileVideo className="w-10 h-10 mr-4 text-primary" />
                          )}
                          <div>
                            <p className="font-medium truncate max-w-xs">
                              {uploadedMedia.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(uploadedMedia.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={clearMedia}
                          disabled={isUploading}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        File ready to upload
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upload Thumbnail (Optional)</CardTitle>
                  <CardDescription>
                    Add a custom thumbnail for your podcast
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!uploadedThumbnail ? (
                    <div
                      className="border-2 border-dashed border-muted rounded-lg p-12 text-center hover:bg-muted/5 transition-colors cursor-pointer"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">
                        Click to upload a thumbnail image
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Supported formats: JPEG, PNG, WebP
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 1280x720px
                      </p>
                      <input
                        type="file"
                        ref={thumbnailInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {thumbnailPreview && (
                            <img 
                              src={thumbnailPreview} 
                              alt="Thumbnail preview" 
                              className="w-16 h-16 object-cover rounded mr-4"
                            />
                          )}
                          <div>
                            <p className="font-medium truncate max-w-xs">
                              {uploadedThumbnail.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(uploadedThumbnail.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={clearThumbnail}
                          disabled={isUploading}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Thumbnail ready to upload
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Please don't close this page while your content is uploading
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/professor/manage")}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUploading || uploadPodcastMutation.isPending}
            >
              {(isUploading || uploadPodcastMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload Podcast
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

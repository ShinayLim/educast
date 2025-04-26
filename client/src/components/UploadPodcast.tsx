import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { insertPodcastSchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, Image, Music, Loader2, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const categories = [
  "Science",
  "History",
  "Literature",
  "Mathematics",
  "Computer Science",
  "Philosophy",
  "Psychology",
  "Economics",
  "Business",
  "Arts",
  "Music",
  "Languages",
  "Education",
  "Other"
];

// Extend the podcast schema with custom validation
const uploadPodcastSchema = insertPodcastSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).min(1, "Add at least one tag").optional(),
  transcript: z.string().optional(),
  audioFile: z.any().optional(),
  imageFile: z.any().optional(),
}).omit({ authorId: true, audioUrl: true, coverArt: true, duration: true });

type UploadPodcastFormValues = z.infer<typeof uploadPodcastSchema>;

export default function UploadPodcast() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");
  const [audioUploading, setAudioUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const form = useForm<UploadPodcastFormValues>({
    resolver: zodResolver(uploadPodcastSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: [],
      transcript: "",
      published: true,
    },
  });
  
  // Handle audio file selection
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.includes("audio/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an audio file (.mp3, .wav, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Audio file must be less than 50MB",
          variant: "destructive",
        });
        return;
      }
      
      setAudioFile(file);
      
      // Create temporary URL for audio preview
      const url = URL.createObjectURL(file);
      
      // Set up audio element to get duration
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(audio.duration);
      });
      
      setAudioUrl(url);
    }
  };
  
  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.includes("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (.jpg, .png, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image file must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
      setCoverArt(URL.createObjectURL(file));
    }
  };
  
  // Handle tag input and addition
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = form.getValues().tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues().tags || [];
    form.setValue(
      'tags',
      currentTags.filter(t => t !== tag)
    );
  };
  
  // Upload audio file
  const uploadAudioMutation = useMutation({
    mutationFn: async (file: File) => {
      setAudioUploading(true);
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await fetch('/api/podcasts/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to upload audio file');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setAudioUploading(false);
      return data.audioUrl;
    },
    onError: (error) => {
      setAudioUploading(false);
      toast({
        title: "Upload Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      return null;
    },
  });
  
  // Upload image file
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('cover', file);
      
      const response = await fetch('/api/podcasts/cover', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to upload image file');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setImageUploading(false);
      return data.coverArt;
    },
    onError: (error) => {
      setImageUploading(false);
      toast({
        title: "Upload Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
      return null;
    },
  });
  
  // Create podcast
  const createPodcastMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/podcasts', data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Podcast Published",
        description: "Your podcast has been successfully published!",
      });
      form.reset();
      setAudioFile(null);
      setImageFile(null);
      setAudioUrl(null);
      setCoverArt(null);
      setAudioDuration(null);
      queryClient.invalidateQueries({ queryKey: ['/api/podcasts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/podcasts/user/${user?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Publish Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = async (data: UploadPodcastFormValues) => {
    if (!audioFile) {
      toast({
        title: "Missing Audio File",
        description: "Please upload an audio file for your podcast",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Upload audio file
      const audioUploadResult = await uploadAudioMutation.mutateAsync(audioFile);
      
      // Upload image file (if provided)
      let coverArtUrl = null;
      if (imageFile) {
        const imageUploadResult = await uploadImageMutation.mutateAsync(imageFile);
        coverArtUrl = imageUploadResult.coverArt;
      }
      
      // Create podcast
      await createPodcastMutation.mutateAsync({
        ...data,
        audioUrl: audioUploadResult.audioUrl,
        coverArt: coverArtUrl,
        duration: audioDuration,
        authorId: user?.id,
      });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
  
  const isProcessing = 
    form.formState.isSubmitting || 
    audioUploading || 
    imageUploading || 
    uploadAudioMutation.isPending || 
    uploadImageMutation.isPending || 
    createPodcastMutation.isPending;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Podcast</CardTitle>
            <CardDescription>
              Share your educational content with students around the world
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter podcast title" {...field} />
                    </FormControl>
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
                        placeholder="Enter a detailed description of your podcast" 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "true")}
                        defaultValue={field.value ? "true" : "false"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Set visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Publish immediately</SelectItem>
                          <SelectItem value="false">Save as draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.watch('tags')?.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-secondary-foreground/80 hover:text-secondary-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <FormControl>
                  <Input
                    placeholder="Add tags (press Enter to add)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </FormControl>
                <FormDescription>
                  Add relevant tags to help students find your podcast
                </FormDescription>
                <FormMessage />
              </FormItem>
              
              <FormField
                control={form.control}
                name="transcript"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transcript (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a transcript of your podcast content" 
                        rows={6}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Adding a transcript improves accessibility and searchability
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Media Upload Section */}
            <div className="grid gap-6 mt-8">
              <h3 className="text-lg font-semibold">Media Files</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audio Upload */}
                <div className="space-y-4">
                  <Label htmlFor="audio-upload">Audio File (Required)</Label>
                  <div className="border border-dashed rounded-lg p-6 text-center">
                    {audioUrl ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <Music className="h-10 w-10 text-primary" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{audioFile?.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {(audioFile?.size ? (audioFile.size / (1024 * 1024)).toFixed(2) : '0')} MB
                            {audioDuration && ` • ${Math.floor(audioDuration / 60)}:${Math.floor(audioDuration % 60).toString().padStart(2, '0')}`}
                          </p>
                        </div>
                        <audio ref={audioRef} src={audioUrl} controls className="w-full" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAudioFile(null);
                            setAudioUrl(null);
                            setAudioDuration(null);
                          }}
                        >
                          Remove File
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="bg-muted/30 p-4 rounded-full">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <Label
                              htmlFor="audio-upload"
                              className="cursor-pointer text-primary hover:underline"
                            >
                              Click to upload
                            </Label>{" "}
                            or drag and drop
                          </div>
                          <div className="text-xs text-muted-foreground">
                            MP3, WAV, or OGG (max. 50MB)
                          </div>
                        </div>
                        <Input
                          id="audio-upload"
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={handleAudioSelect}
                        />
                      </>
                    )}
                  </div>
                </div>
                
                {/* Cover Art Upload */}
                <div className="space-y-4">
                  <Label htmlFor="image-upload">Cover Art (Optional)</Label>
                  <div className="border border-dashed rounded-lg p-6 text-center">
                    {coverArt ? (
                      <div className="space-y-4">
                        <div className="relative w-32 h-32 mx-auto">
                          <img
                            src={coverArt}
                            alt="Cover Art Preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{imageFile?.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {(imageFile?.size ? (imageFile.size / (1024 * 1024)).toFixed(2) : '0')} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setImageFile(null);
                            setCoverArt(null);
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="bg-muted/30 p-4 rounded-full">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <Label
                              htmlFor="image-upload"
                              className="cursor-pointer text-primary hover:underline"
                            >
                              Click to upload
                            </Label>{" "}
                            or drag and drop
                          </div>
                          <div className="text-xs text-muted-foreground">
                            JPG, PNG, or GIF (max. 5MB)
                          </div>
                        </div>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageSelect}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Warning for missing audio */}
            {form.formState.isSubmitted && !audioFile && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Audio file is required. Please upload an audio file.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                form.reset();
                setAudioFile(null);
                setImageFile(null);
                setAudioUrl(null);
                setCoverArt(null);
                setAudioDuration(null);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Podcast
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

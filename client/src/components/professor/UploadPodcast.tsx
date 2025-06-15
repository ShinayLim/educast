import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/lib/supabase";

// ✅ YouTube URL regex validation
const uploadPodcastSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  youtubeUrl: z
    .string()
    .url("Must be a valid URL")
    .regex(
      /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/,
      "Must be a valid YouTube URL"
    ),
  tags: z.string().optional(),
});

type UploadPodcastFormValues = z.infer<typeof uploadPodcastSchema>;

function getYoutubeId(url: string): string | null {
  const regExp =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&?]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function UploadPodcast() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UploadPodcastFormValues>({
    resolver: zodResolver(uploadPodcastSchema),
    defaultValues: {
      title: "",
      description: "",
      youtubeUrl: "",
      tags: "",
    },
  });

  const uploadPodcastMutation = useMutation({
    mutationFn: async (data: UploadPodcastFormValues) => {
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      const { error } = await supabase.from("podcasts").insert([
        {
          title: data.title,
          description: data.description,
          youtube_url: data.youtubeUrl,
          tags: data.tags?.split(",").map((t) => t.trim()),
        },
      ]);

      if (error) {
        throw new Error(error.message || "Failed to upload podcast");
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcasts"] });
      toast({
        title: "Podcast Uploaded",
        description: "Your YouTube podcast is now available.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: UploadPodcastFormValues) => {
    uploadPodcastMutation.mutate(values);
  };

  const videoId = getYoutubeId(form.watch("youtubeUrl") || "");

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Embed YouTube Podcast</CardTitle>
        <CardDescription>
          Share your podcast by embedding a YouTube video.
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
                    <Input placeholder="Podcast title..." {...field} />
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
                      placeholder="Podcast description..."
                      className="h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="youtubeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be a public YouTube video.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {videoId && (
              <div className="mt-4">
                <iframe
                  className="w-full aspect-video rounded-md"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="education, science" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated tags.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0">
              <Button
                type="submit"
                className="w-full"
                disabled={uploadPodcastMutation.isPending}
              >
                {uploadPodcastMutation.isPending
                  ? "Uploading..."
                  : "Submit Podcast"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

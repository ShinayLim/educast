import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Podcast } from "@shared/schema";
import { PodcastList } from "@/components/podcast/podcast-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Users, Headphones, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";

export function ProfessorDashboard() {
  const { user } = useAuth();

  const { data: podcasts = [], isLoading } = useQuery<Podcast[]>({
    queryKey: [`/podcasts/professor/${user?.id}`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("professorId", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message || "Failed to fetch podcasts");
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: comments = [] } = useQuery({
    queryKey: [`/podcasts/professor/${user?.id}/comments`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts_comments")
        .select("id, user_id, podcast_id")
        .in(
          "podcast_id",
          podcasts.map((p) => p.id)
        );

      if (error) throw new Error(error.message || "Failed to fetch comments");
      return data || [];
    },
    enabled: podcasts.length > 0,
  });

  // 📊 Calculate Metrics
  const totalViews = podcasts.reduce((sum, p) => sum + (p.views || 0), 0);

  const totalEngagement = comments.length;
  const engagementRate =
    totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

  const uniqueStudents = [
    ...new Set(comments.map((comment: any) => comment.user_id)),
  ];
  const studentReach = uniqueStudents.length;

  const audioPodcasts = podcasts.filter((p) => p.mediaType === "audio").length;
  const videoPodcasts = podcasts.filter((p) => p.mediaType === "video").length;

  const recentPodcasts = [...podcasts]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{podcasts.length}</div>
            <p className="text-xs text-muted-foreground">
              {audioPodcasts} audio, {videoPodcasts} video
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Rate
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {engagementRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentReach}</div>
            <p className="text-xs text-muted-foreground">
              Unique student listeners
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for content creators</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <Button asChild className="w-full justify-start">
              <Link href="/professor/upload">
                <Headphones className="mr-2 h-5 w-5" />
                Upload New Audio/Video
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/professor/manage">
                <Activity className="mr-2 h-5 w-5" />
                View Content Analytics
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/professor/manage">
                <Users className="mr-2 h-5 w-5" />
                Manage Published Content
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Recent Uploads</h2>

        {recentPodcasts.length === 0 ? (
          <p className="text-muted-foreground">
            You haven't uploaded any podcasts yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentPodcasts.map((podcast) => (
              <Card
                key={podcast.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {podcast.title}
                  </CardTitle>
                  <CardDescription className="capitalize text-xs">
                    {podcast.mediaType} •{" "}
                    {new Date(podcast.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href={`/player/${podcast.id}`}>View Podcast</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {podcasts.length > 4 && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => (window.location.href = "/professor/manage")}
              variant="outline"
            >
              Show More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

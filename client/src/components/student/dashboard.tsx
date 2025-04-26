import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Podcast, User } from "@shared/schema";
import { PodcastList } from "@/components/podcast/podcast-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BookOpen, Search, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function StudentDashboard() {
  const { user } = useAuth();
  
  // Fetch all podcasts
  const { data: allPodcasts = [], isLoading: isLoadingPodcasts } = useQuery<Podcast[]>({
    queryKey: ['/api/podcasts'],
  });
  
  // Fetch professors
  const { data: professors = [], isLoading: isLoadingProfessors } = useQuery<User[]>({
    queryKey: ['/api/users'],
    select: (users) => users.filter(user => user.role === 'professor'),
  });
  
  // Get featured/recommended podcasts (newest 4)
  const featuredPodcasts = [...allPodcasts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  
  // Get popular podcasts (random 4 for demo, would be based on views/likes in production)
  const popularPodcasts = [...allPodcasts]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);
  
  // Get audio podcasts
  const audioPodcasts = allPodcasts
    .filter(podcast => podcast.mediaType === 'audio')
    .slice(0, 4);
  
  // Get video podcasts
  const videoPodcasts = allPodcasts
    .filter(podcast => podcast.mediaType === 'video')
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Podcasts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPodcasts.length}</div>
            <p className="text-xs text-muted-foreground">
              {audioPodcasts.length} audio, {videoPodcasts.length} video
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professors</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professors.length}</div>
            <p className="text-xs text-muted-foreground">
              Educational content creators
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Played</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Start listening to track progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Playlists</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Create playlists to organize content
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Welcome to EduCast</CardTitle>
            <CardDescription>
              Discover educational podcasts from leading professors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Browse through our collection of educational content, create playlists, 
              and engage with professors and other students. Track your learning progress 
              and download content for offline listening.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild className="w-full">
                <Link href="/browse">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse All Content
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/student/library">
                  <List className="mr-2 h-5 w-5" />
                  My Library
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/student/professors">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Professors
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Follow these steps to make the most of EduCast
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium mb-1">Browse Content</h4>
                <p className="text-sm text-muted-foreground">Discover educational podcasts from various professors</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium mb-1">Create Playlists</h4>
                <p className="text-sm text-muted-foreground">Organize content based on topics or courses</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium mb-1">Engage with Content</h4>
                <p className="text-sm text-muted-foreground">Comment, like, and share educational podcasts</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-medium mb-1">Track Progress</h4>
                <p className="text-sm text-muted-foreground">Monitor your learning journey</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <PodcastList
        title="Featured Podcasts"
        podcasts={featuredPodcasts}
        emptyMessage="No featured podcasts available"
        showMore={allPodcasts.length > 4}
        onShowMore={() => window.location.href = "/browse"}
      />
      
      <PodcastList
        title="Popular Audio Podcasts"
        podcasts={audioPodcasts}
        emptyMessage="No audio podcasts available"
        showMore={audioPodcasts.length > 4}
        onShowMore={() => window.location.href = "/browse"}
      />
      
      <PodcastList
        title="Video Lectures"
        podcasts={videoPodcasts}
        emptyMessage="No video lectures available"
        showMore={videoPodcasts.length > 4}
        onShowMore={() => window.location.href = "/browse"}
      />
    </div>
  );
}

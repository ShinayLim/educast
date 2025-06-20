import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Podcast } from "@shared/schema";
import { PodcastList } from "@/components/podcast/podcast-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Activity, Users, Headphones, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function ProfessorDashboard() {
  const { user } = useAuth();
  
  // Fetch professor's podcasts
  const { data: podcasts = [], isLoading } = useQuery<Podcast[]>({
    queryKey: [`/api/professors/${user?.id}/podcasts`],
    enabled: !!user?.id,
  });
  
  // Get recent and popular podcasts
  const recentPodcasts = [...podcasts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);
  
  // Mock analytics data (this would come from real analytics in a production app)
  const analyticsData = [
    { name: 'Mon', views: 120, engagement: 30 },
    { name: 'Tue', views: 150, engagement: 40 },
    { name: 'Wed', views: 180, engagement: 45 },
    { name: 'Thu', views: 170, engagement: 35 },
    { name: 'Fri', views: 190, engagement: 50 },
    { name: 'Sat', views: 110, engagement: 25 },
    { name: 'Sun', views: 100, engagement: 20 },
  ];
  
  const audioPodcasts = podcasts.filter(p => p.mediaType === 'audio').length;
  const videoPodcasts = podcasts.filter(p => p.mediaType === 'video').length;

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
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.3%</div>
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
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              Unique student listeners
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>
              Views and engagement for the past week
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Bar 
                  dataKey="views" 
                  fill="hsl(var(--chart-1))" 
                  radius={[4, 4, 0, 0]} 
                  name="Views"
                />
                <Bar 
                  dataKey="engagement" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]} 
                  name="Engagement"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for content creators
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <Button asChild className="w-full justify-start">
              {/* <Link href="/professor/upload">
                <Headphones className="mr-2 h-5 w-5" />
                Upload New Audio Podcast
              </Link> */}
            </Button>
            <Button asChild className="w-full justify-start">
              <Link href="/professor/upload">
                <Video className="mr-2 h-5 w-5" />
                Upload New Video Lecture
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
      
      <PodcastList
        title="Recent Uploads"
        podcasts={recentPodcasts}
        emptyMessage="You haven't uploaded any podcasts yet"
        showMore={podcasts.length > 4}
        onShowMore={() => window.location.href = "/professor/manage"}
      />
    </div>
  );
}

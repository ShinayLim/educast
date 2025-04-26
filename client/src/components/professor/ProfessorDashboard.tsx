import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Podcast, Users, BarChart } from "lucide-react";
import UploadPodcast from "./UploadPodcast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import PodcastList from "../shared/PodcastList";

export function ProfessorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch professor's podcasts
  const { data: podcasts = [] } = useQuery({
    queryKey: ["/api/professors", user?.id, "podcasts"],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/professors/${user.id}/podcasts`);
      if (!response.ok) throw new Error("Failed to fetch podcasts");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Professor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your educational content and track student engagement.
          </p>
        </div>
        
        {activeTab !== "upload" && (
          <Button onClick={() => setActiveTab("upload")}>
            <Plus className="mr-2 h-4 w-4" />
            New Podcast
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="podcasts">My Podcasts</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Podcasts</CardTitle>
                <Podcast className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{podcasts.length}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.max(0, podcasts.filter(p => 
                    new Date(p.createdAt).getMonth() === new Date().getMonth()
                  ).length)} this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Listeners</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* Calculate unique listeners across all podcasts */}
                  {new Set(podcasts.flatMap(p => p.views || []).map(v => v.userId)).size || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique students who accessed your content
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* Calculate based on likes + comments divided by views */}
                  {podcasts.length 
                    ? Math.round((podcasts.reduce((sum, p) => 
                      sum + ((p.likes?.length || 0) + (p.comments?.length || 0)), 0) / 
                      Math.max(1, podcasts.reduce((sum, p) => sum + (p.views?.length || 0), 0))) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Likes and comments per view
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Podcasts</CardTitle>
                <CardDescription>
                  Your most recently uploaded content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PodcastList 
                  podcasts={podcasts.slice(0, 5)} 
                  emptyMessage="You haven't uploaded any podcasts yet." 
                  variant="compact"
                />
                
                {podcasts.length > 5 && (
                  <Button 
                    variant="link" 
                    className="mt-4 p-0"
                    onClick={() => setActiveTab("podcasts")}
                  >
                    View all podcasts
                  </Button>
                )}
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Popular Content</CardTitle>
                <CardDescription>
                  Your most viewed and liked podcasts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PodcastList 
                  podcasts={[...podcasts].sort((a, b) => 
                    (b.views?.length || 0) - (a.views?.length || 0)
                  ).slice(0, 5)} 
                  emptyMessage="No engagement data available yet."
                  variant="compact"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="podcasts">
          <Card>
            <CardHeader>
              <CardTitle>My Podcasts</CardTitle>
              <CardDescription>
                All your uploaded podcasts and educational content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PodcastList 
                podcasts={podcasts} 
                emptyMessage="You haven't uploaded any podcasts yet."
                variant="list"
                showActions
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <UploadPodcast />
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>
                Track engagement and performance of your educational content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {podcasts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You need to upload podcasts to see analytics.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab("upload")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Your First Podcast
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Analytics sections would go here */}
                  <p className="text-muted-foreground text-center">
                    Detailed analytics coming soon!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
// client\src\pages\player\PlayerPage.tsxa
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useState } from "react";

export default function PlayerPage() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, navigate] = useLocation();

  const { data: podcast, isLoading } = useQuery({
    queryKey: [`/player/${id}`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message || "Failed to fetch podcast");
      }

      return data;
    },
    enabled: !!id,
  });

  const getYoutubeId = (url: string | null | undefined) => {
    if (!url) return "";
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&?]+)/
    );
    return match ? match[1] : "";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : podcast ? (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold">{podcast.title}</h1>
                <p className="text-muted-foreground">{podcast.description}</p>

                <div className="aspect-video rounded border border-border overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${getYoutubeId(
                      podcast.youtube_url
                    )}`}
                    title={podcast.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <Button variant="outline" onClick={() => navigate("/")}>
                  ← Back to Dashboard
                </Button>
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-bold mb-4">Podcast not found</h3>
                <Button variant="outline" onClick={() => navigate("/")}>
                  ← Back to Dashboard
                </Button>
              </div>
            )}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

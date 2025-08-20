import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { useState } from "react";
import { Profile } from "@shared/schema";
import Meta from "@/components/Meta";

type Professor = Profile;

type Podcast = {
  id: number;
  title: string;
  description?: string;
  mediaType: string;
  created_at: string;
};

export default function ProfessorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch professor info
  const { data: professor, isLoading: profLoading } = useQuery<Professor>({
    queryKey: [`/professor/${id}`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles") // assuming you store professors in profiles
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

  // Fetch professor podcasts
  const { data: podcasts = [], isLoading: podLoading } = useQuery<Podcast[]>({
    queryKey: [`/professor/${id}/podcasts`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("professor_id", id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!id,
  });

  if (profLoading || podLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!professor) {
    return <div className="text-center mt-20">Professor not found</div>;
  }

  return (
    <>
      <Meta
        title={`EduCast | ${professor.full_name}`}
        description={professor.bio || "Professor profile page"}
      />
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 md:ml-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="container mx-auto px-4 pb-24 md:px-6">
            <div className="py-8">
              {/* Profile Section */}
              <div className="flex items-center gap-6 mb-10">
                <img
                  src={professor.avatar_url || "/default-avatar.png"}
                  alt={professor.full_name}
                  className="w-24 h-24 rounded-full border border-border"
                />
                <div>
                  <h1 className="text-3xl font-bold">{professor.full_name}</h1>
                  <p className="text-muted-foreground">{professor.email}</p>
                  {professor.bio && (
                    <p className="mt-2 text-foreground">{professor.bio}</p>
                  )}
                </div>
              </div>

              {/* Podcasts List */}
              <h2 className="text-2xl font-semibold mb-4">Uploaded Podcasts</h2>
              {podcasts.length > 0 ? (
                <div className="space-y-4">
                  {podcasts.map(
                    (podcast) => (
                      console.log("Podcast:", podcast),
                      (
                        <div
                          key={podcast.id}
                          className="border border-border rounded-lg p-4"
                        >
                          <h3 className="text-lg font-semibold">
                            {podcast.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(podcast.created_at).toLocaleDateString()}
                          </p>
                          <p className="mb-3">
                            {podcast.description || "No description provided"}
                          </p>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/player/${podcast.id}`}>
                              View Podcast
                            </Link>
                          </Button>
                        </div>
                      )
                    )
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No podcasts uploaded yet.
                </p>
              )}
            </div>
          </main>

          <MobileNav />
        </div>
      </div>
    </>
  );
}

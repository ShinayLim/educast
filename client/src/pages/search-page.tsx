import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PodcastCard } from "@/components/podcast/podcast-card";
import { Podcast, User } from "@shared/schema";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PodcastList from "@/components/shared/PodcastList";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchPage() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 350);

  // Extract query from URL if present
  useEffect(() => {
    console.log("useEffect triggered, location:", location);
    console.log("window.location.search:", window.location.search);
    console.log("window.location.href:", window.location.href);

    // Use window.location.search
    const params = new URLSearchParams(window.location.search);
    console.log("Params object:", params);
    const q = params.get("q");
    console.log("Extracted query 'q':", q);
    if (q) {
      const decodedQuery = decodeURIComponent(q);
      console.log("Decoded query:", decodedQuery);
      setSearchQuery(decodedQuery);
    } else {
      console.log("No query found, setting empty string");
      setSearchQuery("");
    }
  }, [location, window.location.search]);

  // Fetch all podcasts
  const { data: allPodcasts = [], isLoading: isLoadingPodcasts } = useQuery<
    Podcast[]
  >({
    queryKey: ["/api/podcasts"],
    queryFn: async () => {
      const response = await fetch("/api/podcasts");
      if (!response.ok) {
        throw new Error("Failed to fetch podcasts");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
  });

  // Fetch all users (professors)
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter podcasts based on search query
  const filteredPodcasts = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return allPodcasts;
    }

    return allPodcasts.filter((podcast) => {
      const query = debouncedSearchQuery.toLowerCase();
      console.log(
        `Filtering podcast "${podcast.title}" against query "${query}"`
      );
      const matches =
        podcast.title.toLowerCase().includes(query) ||
        podcast.description.toLowerCase().includes(query) ||
        (podcast.tags &&
          podcast.tags.some((tag) => tag.toLowerCase().includes(query)));
      console.log(`Podcast "${podcast.title}" matches:`, matches);
      return matches;
    });
  }, [allPodcasts, debouncedSearchQuery]);

  console.log("Search query:", searchQuery);
  console.log("All podcasts count:", allPodcasts.length);
  console.log("Filtered podcasts count:", filteredPodcasts.length);

  // Filter professors based on search query
  const professors = users.filter((user) => user.role === "professor");
  const filteredProfessors = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return professors;
    }

    return professors.filter((professor) => {
      const query = debouncedSearchQuery.toLowerCase();
      return (
        professor.full_name.toLowerCase().includes(query) ||
        professor.username.toLowerCase().includes(query) ||
        (professor.bio && professor.bio.toLowerCase().includes(query))
      );
    });
  }, [professors, debouncedSearchQuery]);

  // Handle search from header
  const handleHeaderSearch = (query: string) => {
    setSearchQuery(query);
    // Update URL without navigation to avoid re-render
    const newUrl = query.trim()
      ? `/search?q=${encodeURIComponent(query.trim())}`
      : "/search";
    window.history.replaceState({}, "", newUrl);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL when searching from the page's search input
    const newUrl = searchQuery.trim()
      ? `/search?q=${encodeURIComponent(searchQuery.trim())}`
      : "/search";
    navigate(newUrl);
  };

  const isLoading = isLoadingPodcasts || isLoadingUsers;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen onClose={() => null} />

      <div className="flex-1 md:ml-64">
        <Header onMenuClick={() => {}} onSearch={handleHeaderSearch} />

        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-6">
            {/* Mobile search input (since header search is hidden on mobile) */}
            <div className="max-w-2xl mx-auto mb-8 md:hidden">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search podcasts, educators, topics..."
                    className="pl-10 py-6 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>
            </div>

            {/* Show search query and results count */}
            {searchQuery.trim() && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">
                  Search results for "{searchQuery}"
                </h1>
                <p className="text-muted-foreground">
                  Found {filteredPodcasts.length + filteredProfessors.length}{" "}
                  results
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="podcasts" className="w-full">
                <TabsList className="mb-8">
                  <TabsTrigger value="podcasts">
                    Podcasts ({filteredPodcasts.length})
                  </TabsTrigger>
                  <TabsTrigger value="educators">
                    Educators ({filteredProfessors.length})
                  </TabsTrigger>
                </TabsList>

                {/* <TabsContent value="podcasts">
                  {filteredPodcasts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredPodcasts.map((podcast) => (
                        <PodcastCard
                          key={podcast.id}
                          id={podcast.id}
                          title={podcast.title}
                          author={
                            professors.find((p) => p.id === podcast.professorId)
                              ?.fullName || "Unknown"
                          }
                          authorId={podcast.professorId}
                          thumbnailUrl={podcast.thumbnailUrl || undefined}
                          duration={podcast.duration || undefined}
                          mediaType={podcast.mediaType as "audio" | "video"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-2">
                        No podcasts found
                      </h3>
                      <p className="text-muted-foreground">
                        {debouncedSearchQuery
                          ? `No podcasts match "${debouncedSearchQuery}". Try different keywords.`
                          : "Try searching for podcasts or browse our categories"}
                      </p>
                    </div>
                  )}
                </TabsContent> */}

                <TabsContent value="podcasts">
                  <PodcastList
                    podcasts={filteredPodcasts}
                    emptyMessage={
                      debouncedSearchQuery
                        ? `No podcasts match "${debouncedSearchQuery}". Try different keywords.`
                        : "Try searching for podcasts or browse our categories"
                    }
                  />
                </TabsContent>

                <TabsContent value="educators">
                  {filteredProfessors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {filteredProfessors.map((professor) => (
                        <div
                          key={professor.id}
                          className="bg-card border border-border rounded-lg overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                          <div className="p-6 flex flex-col items-center text-center">
                            {professor.avatar_url ? (
                              <img
                                src={professor.avatar_url}
                                alt={professor.full_name}
                                className="w-24 h-24 rounded-full mb-4 object-cover"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                                {professor.full_name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <h3 className="font-bold text-lg mb-1">
                              {professor.full_name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Professor
                            </p>

                            {professor.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                {professor.bio}
                              </p>
                            )}

                            <a
                              href={`/professor/${professor.id}`}
                              className="text-primary text-sm hover:underline"
                            >
                              View Profile
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-2">
                        No educators found
                      </h3>
                      <p className="text-muted-foreground">
                        {debouncedSearchQuery
                          ? `No educators match "${debouncedSearchQuery}". Try different keywords.`
                          : "Try searching for educators or browse our featured professors"}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}

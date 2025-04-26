import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Compass,
  Library,
  Clock,
  Heart,
  PlusCircle,
  Mic,
  Users,
  BookOpen,
  Upload,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, isProfessor } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" 
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 z-50 h-full w-64 border-r bg-card transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-6 w-6 text-primary"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M16 12v-4"></path>
              <path d="M8 12v4"></path>
              <path d="M12 16H8"></path>
              <path d="M12 8h4"></path>
            </svg>
            <span className="font-bold text-xl">EduCast</span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] py-2">
          <nav className="px-2 py-2">
            <div className="space-y-1">
              <Link href="/">
                <a className={`sidebar-link flex items-center px-3 py-2 text-sm rounded-md w-full ${isActive("/") ? "active" : ""}`}>
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </a>
              </Link>
              <Link href="/search">
                <a className={`sidebar-link flex items-center px-3 py-2 text-sm rounded-md w-full ${isActive("/search") ? "active" : ""}`}>
                  <Compass className="mr-2 h-4 w-4" />
                  Discover
                </a>
              </Link>
              <Link href={isProfessor ? "/professor-dashboard" : "/student-dashboard"}>
                <a className={`sidebar-link flex items-center px-3 py-2 text-sm rounded-md w-full ${
                  isActive("/professor-dashboard") || isActive("/student-dashboard") ? "active" : ""
                }`}>
                  {isProfessor ? (
                    <Mic className="mr-2 h-4 w-4" />
                  ) : (
                    <BookOpen className="mr-2 h-4 w-4" />
                  )}
                  {isProfessor ? "My Content" : "My Learning"}
                </a>
              </Link>
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              <h3 className="px-4 text-xs font-semibold text-muted-foreground">LIBRARY</h3>
              <Link href="/playlists">
                <a className={`sidebar-link flex items-center px-3 py-2 text-sm rounded-md w-full ${isActive("/playlists") ? "active" : ""}`}>
                  <Library className="mr-2 h-4 w-4" />
                  Your Playlists
                </a>
              </Link>
              <Link href="/recent">
                <a className={`sidebar-link flex items-center px-3 py-2 text-sm rounded-md w-full ${isActive("/recent") ? "active" : ""}`}>
                  <Clock className="mr-2 h-4 w-4" />
                  Recently Played
                </a>
              </Link>
              <Link href="/favorites">
                <a className={`sidebar-link flex items-center px-3 py-2 text-sm rounded-md w-full ${isActive("/favorites") ? "active" : ""}`}>
                  <Heart className="mr-2 h-4 w-4" />
                  Liked Podcasts
                </a>
              </Link>
              <Button 
                variant="ghost" 
                className="sidebar-link flex items-center justify-start px-3 py-2 text-sm rounded-md w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Playlist
              </Button>
            </div>

            {isProfessor && (
              <>
                <Separator className="my-4" />
                <div className="space-y-1">
                  <h3 className="px-4 text-xs font-semibold text-muted-foreground">CREATE</h3>
                  <Link href="/professor-dashboard/upload">
                    <a className={`sidebar-link flex items-center px-3 py-2 text-sm rounded-md w-full ${isActive("/professor-dashboard/upload") ? "active" : ""}`}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Podcast
                    </a>
                  </Link>
                  <Link href="/professor-dashboard/analytics">
                    <a className={`sidebar-link flex items-center px-3 py-2 text-sm rounded-md w-full ${isActive("/professor-dashboard/analytics") ? "active" : ""}`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2 h-4 w-4"
                      >
                        <path d="M3 3v18h18"></path>
                        <path d="M7 16l4-4 4 4 4-4"></path>
                      </svg>
                      Analytics
                    </a>
                  </Link>
                </div>
              </>
            )}

            <Separator className="my-4" />
            <div className="space-y-1">
              <h3 className="px-4 text-xs font-semibold text-muted-foreground">SUBSCRIPTIONS</h3>
              <Link href="/subscriptions">
                <a className={`sidebar-link flex items-center px-3 py-2 text-sm rounded-md w-full ${isActive("/subscriptions") ? "active" : ""}`}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Subscriptions
                </a>
              </Link>
              
              {/* Example list of subscriptions */}
              <div className="mt-2 space-y-1 pl-2">
                <Link href="/profile/1">
                  <a className="flex items-center px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-xs">JS</span>
                    Prof. Jane Smith
                  </a>
                </Link>
                <Link href="/profile/2">
                  <a className="flex items-center px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center mr-2 text-xs">MT</span>
                    Dr. Mike Thomson
                  </a>
                </Link>
              </div>
            </div>
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}

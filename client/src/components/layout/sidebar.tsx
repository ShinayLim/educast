import { Link, useLocation } from "wouter";
import { X, Home, Search, Headphones, Upload, BookOpen, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isProfessor = user?.role === "professor";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <Link href="/">
          <div className="flex items-center gap-2 font-bold text-xl cursor-pointer">
            EduCast
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="p-4 space-y-2">
          <div className="mb-4">
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Navigation
            </h2>
            <div className="space-y-1">
              <Link href="/">
                <div className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent cursor-pointer ${
                  location === "/" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}>
                  <Home className="h-4 w-4" />
                  Home
                </div>
              </Link>
              <Link href="/search">
                <div className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent cursor-pointer ${
                  location === "/search" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}>
                  <Search className="h-4 w-4" />
                  Search
                </div>
              </Link>
              
              {isProfessor ? (
                // Professor navigation
                <>
                  <Link href="/professor/upload">
                    <div className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent cursor-pointer ${
                      location === "/professor/upload" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}>
                      <Upload className="h-4 w-4" />
                      Upload Content
                    </div>
                  </Link>
                  <Link href="/professor/manage">
                    <div className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent cursor-pointer ${
                      location === "/professor/manage" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}>
                      <Users className="h-4 w-4" />
                      Manage Content
                    </div>
                  </Link>
                </>
              ) : (
                // Student navigation
                <>
                  <Link href="/student/library">
                    <div className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent cursor-pointer ${
                      location === "/student/library" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}>
                      <BookOpen className="h-4 w-4" />
                      My Library
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* User's subscribed podcasts/playlists would go here */}
          <div>
            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
              Your Playlists
            </h2>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground px-2">
                No playlists yet. Create your first playlist!
              </p>
            </div>
          </div>
          
          {/* Bottom section for settings, support, etc. */}
          <div className="py-4 mt-6">
            <div className="space-y-1">
              <Link href="/settings">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent text-muted-foreground cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </div>
              </Link>
            </div>
          </div>
        </nav>
      </ScrollArea>
    </aside>
  );
}
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
                <a className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                  location === "/" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}>
                  <Home className="h-4 w-4" />
                  Home
                </a>
              </Link>
              <Link href="/search">
                <a className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                  location === "/search" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}>
                  <Search className="h-4 w-4" />
                  Search
                </a>
              </Link>
              
              {isProfessor ? (
                // Professor navigation
                <>
                  <Link href="/professor/upload">
                    <a className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      location === "/professor/upload" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}>
                      <Upload className="h-4 w-4" />
                      Upload Content
                    </a>
                  </Link>
                  <Link href="/professor/manage">
                    <a className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      location === "/professor/manage" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}>
                      <Users className="h-4 w-4" />
                      Manage Content
                    </a>
                  </Link>
                </>
              ) : (
                // Student navigation
                <>
                  <Link href="/student/library">
                    <a className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                      location === "/student/library" ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}>
                      <BookOpen className="h-4 w-4" />
                      My Library
                    </a>
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
                <a className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent text-muted-foreground">
                  <Settings className="h-4 w-4" />
                  Settings
                </a>
              </Link>
            </div>
          </div>
        </nav>
      </ScrollArea>
    </aside>
  );
}
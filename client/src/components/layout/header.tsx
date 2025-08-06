import React, { useState, useEffect } from "react";
import { Menu, Search, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  onMenuClick: () => void;
  onSearch?: (query: string) => void; // Optional callback for search
}

export function Header({ onMenuClick, onSearch }: HeaderProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if we're on the search page
  const isSearchPage = location.startsWith("/search");

  // Extract search query from URL when on search page
  useEffect(() => {
    if (isSearchPage) {
      const params = new URLSearchParams(location.split("?")[1]);
      const q = params.get("q");
      setSearchQuery(q || "");
    }
  }, [location, isSearchPage]);

  // If no user, don't render header (or render a minimal one)
  if (!user) return null;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout(); // calls supabase.auth.signOut() under the hood
      navigate("/auth"); // redirect after successful logout
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Logout failed:", err.message);
      } else {
        console.error("Logout failed with unknown error:", err);
      }
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isSearchPage) {
        // If on search page, call the onSearch callback and update URL
        if (onSearch) {
          onSearch(searchQuery.trim());
        }
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        // If not on search page, navigate to search page with query
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If on search page, call onSearch callback in real-time (optional)
    if (isSearchPage && onSearch) {
      onSearch(value);
    }
  };

  const handleSearchClick = () => {
    // If not on search page, navigate to search page when clicking the search input
    if (!isSearchPage) {
      navigate("/search");
    }
  };

  // Helper to get user initials
  const getUserInitials = () => {
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* left: menu button & brand */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/">
            <span className="font-bold text-xl cursor-pointer">EduCast</span>
          </Link>
        </div>

        {/* center: search bar */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <form
            onSubmit={handleSearchSubmit}
            className="relative max-w-md w-full"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search for podcasts, professors, topics..."
              className="w-full rounded-full border bg-background px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onClick={handleSearchClick}
              readOnly={!isSearchPage} // Make it read-only if not on search page
            />
          </form>
        </div>

        {/* right: notifications, theme, avatar + logout */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
            <span className="sr-only">Notifications</span>
          </Button>

          <ThemeToggle />

          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={undefined /* or user.avatarUrl */}
                alt={user.username}
              />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>

            <div className="hidden md:flex md:flex-col">
              <span className="text-sm font-medium">{user.fullName}</span>

              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

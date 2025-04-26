import { Menu, Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getUserInitials = () => {
    if (!user) return "U";
    
    // Try to get initials from fullName if available
    if (user.fullName) {
      return user.fullName
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    
    // Fallback to username first character
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl">EduCast</span>
            </div>
          </Link>
        </div>
        
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full rounded-full border bg-background px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search for podcasts, professors, topics..."
              type="search"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
            <span className="sr-only">Notifications</span>
          </Button>
          
          <ThemeToggle />
          
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || ""} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex md:flex-col">
              <span className="text-sm font-medium">{user?.fullName || user?.username}</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
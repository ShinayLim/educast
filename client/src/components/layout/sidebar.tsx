import { Link, useLocation } from "wouter";
import { 
  Home, Headphones, Search, BookmarkIcon, 
  Mic, Users, Upload, BarChart, 
  BookOpen, Settings, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../ui/theme-toggle";

interface SidebarLink {
  icon: React.ReactNode;
  label: string;
  href: string;
  role?: string[];
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isProfessor = user?.role === "professor";

  const commonLinks: SidebarLink[] = [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/" },
    { icon: <Search className="h-5 w-5" />, label: "Search", href: "/search" },
    { icon: <Headphones className="h-5 w-5" />, label: "Browse", href: "/browse" }
  ];
  
  const professorLinks: SidebarLink[] = [
    { icon: <Upload className="h-5 w-5" />, label: "Upload Content", href: "/professor/upload", role: ["professor"] },
    { icon: <BarChart className="h-5 w-5" />, label: "Analytics", href: "/professor/analytics", role: ["professor"] },
    { icon: <Mic className="h-5 w-5" />, label: "My Content", href: "/professor/manage", role: ["professor"] }
  ];
  
  const studentLinks: SidebarLink[] = [
    { icon: <BookOpen className="h-5 w-5" />, label: "Library", href: "/student/library", role: ["student"] },
    { icon: <BookmarkIcon className="h-5 w-5" />, label: "Saved", href: "/student/saved", role: ["student"] },
    { icon: <Users className="h-5 w-5" />, label: "Professors", href: "/student/professors", role: ["student"] }
  ];
  
  const renderLinks = (links: SidebarLink[]) => {
    return links.map((link) => {
      // Skip if the link is role-restricted and user doesn't have the role
      if (link.role && !link.role.includes(user?.role || "")) {
        return null;
      }
      
      return (
        <Link key={link.href} href={link.href}>
          <a
            className={cn(
              "sidebar-link flex items-center px-4 py-2 rounded-md text-sm mb-1",
              isActive(link.href)
                ? "active bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {link.icon}
            <span className="ml-3">{link.label}</span>
          </a>
        </Link>
      );
    });
  };

  return (
    <div className="w-64 h-screen fixed top-0 left-0 bg-sidebar border-r border-border flex flex-col z-40">
      <div className="p-4 flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          <Headphones className="h-5 w-5" />
        </div>
        <h1 className="ml-3 font-bold text-xl">EduCast</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <h2 className="px-4 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Main
          </h2>
          {renderLinks(commonLinks)}
        </div>
        
        {isProfessor && (
          <div className="mb-6">
            <h2 className="px-4 text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Creator Tools
            </h2>
            {renderLinks(professorLinks)}
          </div>
        )}
        
        {!isProfessor && (
          <div className="mb-6">
            <h2 className="px-4 text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Your Library
            </h2>
            {renderLinks(studentLinks)}
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.fullName} 
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="ml-2 truncate">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

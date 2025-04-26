import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Home,
  Search,
  Library,
  Upload,
  LucideIcon,
  Settings,
  Users,
  X,
  Menu,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  role?: "professor" | "student" | "all";
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(!isMobile);

  // Navigation items
  const navItems: NavItem[] = [
    { title: "Home", icon: Home, href: "/", role: "all" },
    { title: "Search", icon: Search, href: "/search", role: "all" },
    { title: "Library", icon: Library, href: "/student/library", role: "student" },
    { title: "Upload", icon: Upload, href: "/professor/upload", role: "professor" },
    { title: "Manage Content", icon: Users, href: "/professor/manage", role: "professor" },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    item => item.role === "all" || !item.role || item.role === user?.role
  );

  // Update visibility when isOpen prop changes
  useEffect(() => {
    if (isMobile) {
      setIsVisible(isOpen);
    }
  }, [isOpen, isMobile]);

  // Update visibility when screen size changes
  useEffect(() => {
    setIsVisible(!isMobile);
  }, [isMobile]);

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <div 
          className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 ${
            isVisible ? "block" : "hidden"
          }`}
          onClick={onClose}
        />
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-lg transform transition-transform duration-200 ease-in-out ${
            isVisible ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">EduCast</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <nav className="p-4 space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? onClose : undefined}
              >
                <a
                  className={`flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.href
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="icon"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{user.fullName || user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex-1 flex flex-col min-h-0 border-r bg-card">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <h1 className="text-xl font-bold">EduCast</h1>
          </div>
          
          <nav className="mt-5 flex-1 px-4 space-y-2">
            {filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.href
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </a>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon"
                asChild
              >
                <Link href="/settings">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {user.fullName ? user.fullName[0].toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium truncate">{user.fullName || user.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
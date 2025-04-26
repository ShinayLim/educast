import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

interface HeaderProps {
  showSearch?: boolean;
  transparent?: boolean;
  className?: string;
}

export function Header({ 
  showSearch = true, 
  transparent = false, 
  className 
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className={cn(
      "sticky top-0 z-30 w-full p-4 md:p-6",
      transparent ? "bg-transparent" : "bg-background/95 backdrop-blur-sm border-b border-border",
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
          
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <Headphones className="h-4 w-4" />
          </div>
          <h1 className="ml-2 font-bold text-lg hidden sm:block">EduCast</h1>
        </div>
        
        {showSearch && (
          <form 
            onSubmit={handleSearch}
            className="max-w-md w-full mx-4 hidden md:block"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search podcasts, educators..."
                className="pl-10 bg-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        )}
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
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
                <span className="hidden md:inline-block">{user?.fullName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile
              </DropdownMenuItem>
              {user?.role === "professor" && (
                <DropdownMenuItem onClick={() => navigate("/professor/upload")}>
                  Upload Content
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {showSearch && (
        <form 
          onSubmit={handleSearch}
          className="mt-4 md:hidden"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search podcasts, educators..."
              className="pl-10 bg-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      )}
    </header>
  );
}

import { Headphones } from "lucide-react";

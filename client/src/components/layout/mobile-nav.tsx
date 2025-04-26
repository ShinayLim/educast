import { Link, useLocation } from "wouter";
import { Home, Search, Headphones, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: "Home", href: "/" },
    { icon: <Search className="h-5 w-5" />, label: "Search", href: "/search" },
    { icon: <Headphones className="h-5 w-5" />, label: "Browse", href: "/browse" },
    { icon: <BookOpen className="h-5 w-5" />, label: "Library", href: "/student/library" },
    { icon: <User className="h-5 w-5" />, label: "Profile", href: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background md:hidden z-40">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex flex-col items-center py-3 px-4",
                isActive(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}

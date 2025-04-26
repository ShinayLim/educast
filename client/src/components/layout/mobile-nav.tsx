import { Link, useLocation } from "wouter";
import { Home, Search, Library, Upload, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isProfessor = user?.role === "professor";

  const links = [
    { href: "/", label: "Home", icon: Home, role: "all" },
    { href: "/search", label: "Search", icon: Search, role: "all" },
    { 
      href: "/student/library", 
      label: "Library", 
      icon: Library, 
      role: "student" 
    },
    { 
      href: "/professor/upload", 
      label: "Upload", 
      icon: Upload, 
      role: "professor" 
    },
    { 
      href: "/professor/manage", 
      label: "Manage", 
      icon: Users, 
      role: "professor" 
    },
  ];

  const filteredLinks = links.filter(
    link => link.role === "all" || link.role === user?.role
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t bg-background">
      <div className="grid grid-cols-3 h-16">
        {filteredLinks.slice(0, 3).map((link) => (
          <Link key={link.href} href={link.href}>
            <a
              className={`flex flex-col items-center justify-center h-full text-xs ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <link.icon className="h-5 w-5 mb-1" />
              <span>{link.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
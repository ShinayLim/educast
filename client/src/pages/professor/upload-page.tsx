import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import UploadPodcast from "@/components/professor/UploadPodcast";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";

export default function UploadPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is a professor
  if (user && user.role !== "professor") {
    toast({
      title: "Access denied",
      description: "Only professors can access this page",
      variant: "destructive",
    });
    return <Redirect to="/" />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 md:ml-64">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-6">
            <h1 className="text-3xl font-bold mb-2">Upload Content</h1>
            <p className="text-muted-foreground mb-8">
              Share your knowledge with students by uploading educational podcasts and videos
            </p>
            
            <UploadPodcast />
          </div>
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}
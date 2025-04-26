import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UploadForm } from "@/components/professor/upload-form";
import { useEffect } from "react";

export default function UploadPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if user is not a professor
  useEffect(() => {
    if (user && user.role !== "professor") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 md:ml-64">
        <Header />
        
        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-6">
            <h1 className="text-3xl font-bold mb-1">Upload New Content</h1>
            <p className="text-muted-foreground mb-8">
              Share your knowledge with students by uploading audio or video content
            </p>
            
            <UploadForm />
          </div>
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}

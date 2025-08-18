import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import supabase from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { useState } from "react";
import { Profile } from "@shared/schema";

type Student = Profile;

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch professor info
  const { data: student, isLoading: studLoading } = useQuery<Student>({
    queryKey: [`/student/${id}`],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  });

  if (studLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return <div className="text-center mt-20">Student not found</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-8">
            {/* Profile Section */}
            <div className="flex items-center gap-6 mb-10">
              <img
                src={student.avatar_url || "/default-avatar.png"}
                alt={student.full_name}
                className="w-24 h-24 rounded-full border border-border"
              />
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold">{student.full_name}</h1>
                <p className="text-muted-foreground">{student.email}</p>
                {student.bio && (
                  <p className="mt-2 text-foreground">{student.bio}</p>
                )}
              </div>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}

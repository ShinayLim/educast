import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ProfessorDashboard } from "@/components/professor/dashboard";
import { StudentDashboard } from "@/components/student/dashboard";

export default function HomePage() {
  const { user } = useAuth();
  const isProfessor = user?.role === "professor";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <Header />

        <main className="container mx-auto px-4 pb-24 md:px-6">
          <div className="py-6">
            <h1 className="text-3xl font-bold mb-1">
              Welcome, {user?.fullName}
            </h1>
            <p className="text-muted-foreground mb-8">
              {isProfessor
                ? "Manage your content and connect with your audience"
                : "Discover educational podcasts from top professors"}
            </p>

            {isProfessor ? <ProfessorDashboard /> : <StudentDashboard />}
          </div>
        </main>

        <MobileNav />
      </div>
    </div>
  );
}

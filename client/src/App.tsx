// client/src/App.tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PodcastPage from "@/pages/podcast-page";
import PlaylistPage from "@/pages/playlist-page";
import SearchPage from "@/pages/search-page";
import UploadPage from "@/pages/professor/upload-page";
import ManageContentPage from "@/pages/professor/manage-content";
import LibraryPage from "@/pages/student/library-page";
import PlayerPage from "@/pages/player/PlayerPage";
import EditPodcastPage from "@/pages/professor/EditPodcastPage";
import ProfessorProfilePage from "@/pages/professor/ProfessorProfilePage";
import StudentProfilePage from "@/pages/student/StudentProfilePage";

// 🔑 SuperAdmin pages
import SuperAdminLogin from "@/pages/superadmin/SuperAdminLogin";
import AdminsPage from "@/pages/superadmin/AdminsPage";
import ProfessorsPage from "@/pages/superadmin/ProfessorsPage";
import StudentsPage from "@/pages/superadmin/StudentsPage";
import SuperAdminDashboard from "@/pages/superadmin/Dashboard";
import SuperAdminRoute from "@/pages/superadmin/SuperAdminRoute";

// 🔑 Admin pages
import AdminSignup from "@/pages/admin/AdminSignup";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth" component={AuthPage} />

      {/* Student / Professor shared */}
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/podcast/:id" component={PodcastPage} />
      <ProtectedRoute path="/playlist/:id" component={PlaylistPage} />
      <ProtectedRoute path="/search" component={SearchPage} />
      <ProtectedRoute path="/player/:id" component={PlayerPage} />

      {/* Professor */}
      <ProtectedRoute path="/professor/upload" component={UploadPage} />
      <ProtectedRoute path="/professor/manage" component={ManageContentPage} />
      <ProtectedRoute path="/professor/edit/:id" component={EditPodcastPage} />
      <ProtectedRoute path="/professor/:id" component={ProfessorProfilePage} />

      {/* Student */}
      <ProtectedRoute path="/student/library" component={LibraryPage} />
      <ProtectedRoute path="/student/:id" component={StudentProfilePage} />

      {/* SuperAdmin */}
      <Route path="/superadmin/login" component={SuperAdminLogin} />
      <Route path="/superadmin/dashboard">
        <SuperAdminRoute>
          <SuperAdminDashboard />
        </SuperAdminRoute>
      </Route>
      <ProtectedRoute path="/superadmin/admins" component={AdminsPage} />
      <ProtectedRoute
        path="/superadmin/professors"
        component={ProfessorsPage}
      />
      <ProtectedRoute path="/superadmin/students" component={StudentsPage} />

      {/* Admin */}
      <Route path="/admin/signup" component={AdminSignup} />
      <Route path="/admin/login" component={AdminLogin} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />

      {/* Catch-all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

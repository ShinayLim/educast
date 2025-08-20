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
import ProfessorProfilePage from "@/pages/profile/ProfessorProfilePage";
import StudentProfilePage from "@/pages/profile/StudentProfilePage";
import SuperAdminLogin from "@/pages/superadmin/SuperAdminLogin";

import AdminsPage from "@/pages/superadmin/AdminsPage";
import ProfessorsPage from "@/pages/superadmin/ProfessorsPage";
import StudentsPage from "@/pages/superadmin/StudentsPage";

import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";
import SuperAdminDashboard from "@/pages/superadmin/Dashboard";
import AdminSignup from "./pages/admin/AdminSignup";
import SuperAdminRoute from "@/pages/superadmin/SuperAdminRoute";

import Meta from "@/components/Meta";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/podcast/:id" component={PodcastPage} />
      <ProtectedRoute path="/playlist/:id" component={PlaylistPage} />
      <ProtectedRoute path="/search" component={SearchPage} />
      <ProtectedRoute path="/professor/upload" component={UploadPage} />
      <ProtectedRoute path="/professor/manage" component={ManageContentPage} />
      <ProtectedRoute
        path="/professor/edit/:id"
        component={EditPodcastPage}
      />{" "}
      <ProtectedRoute path="/student/library" component={LibraryPage} />
      <ProtectedRoute
        path="/profile/student/:id"
        component={StudentProfilePage}
      />
      <ProtectedRoute path="/player/:id" component={PlayerPage} />
      <ProtectedRoute
        path="/profile/professor/:id"
        component={ProfessorProfilePage}
      />
      <Route path="/superadmin/login" component={SuperAdminLogin} />
      <Route path="/superadmin/dashboard">
        <SuperAdminRoute>
          <SuperAdminDashboard />
        </SuperAdminRoute>
      </Route>
      <Route path="/superadmin/admins" component={AdminsPage} />
      <Route path="/superadmin/professors" component={ProfessorsPage} />
      <Route path="/superadmin/students" component={StudentsPage} />
      <Route path="/admin/auth" component={AdminSignup} />
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
            <Meta />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

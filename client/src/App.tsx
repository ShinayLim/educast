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

import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/lib/protected-route";

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
      {/* ✅ new route */}
      <ProtectedRoute path="/student/library" component={LibraryPage} />
      <ProtectedRoute path="/player/:id" component={PlayerPage} />
      <Route path="/professor/:id" component={ProfessorProfilePage} />
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

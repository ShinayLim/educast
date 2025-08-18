import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    // not logged in → go to auth page
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // 🚨 prevent admins from logging in if not active
  if (user.role === "admin" && user.status !== "active") {
    return (
      <Route path={path}>
        <Redirect to="/admin/login" />
      </Route>
    );
  }

  // ✅ role-based redirects (so they don’t land on student dashboard accidentally)
  if (user.role === "student" && path.startsWith("/student") === false) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (user.role === "professor" && path.startsWith("/professor") === false) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (user.role === "admin" && path.startsWith("/admin") === false) {
    return (
      <Route path={path}>
        <Redirect to="/admin/dashboard" />
      </Route>
    );
  }

  if (user.role === "superadmin" && path.startsWith("/superadmin") === false) {
    return (
      <Route path={path}>
        <Redirect to="/superadmin/dashboard" />
      </Route>
    );
  }

  // ✅ if all checks pass → render page
  return <Route path={path} component={Component} />;
}

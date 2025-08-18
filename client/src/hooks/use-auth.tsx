// client/src/hooks/use-auth.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User as SBUser, Session } from "@supabase/supabase-js";
import supabase from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
// ────────────────────────────────────────────────────────────
// 1) Shape for logged-in user
// ────────────────────────────────────────────────────────────
export type SelectUser = {
  id: string;
  email: string;
  fullName: string;
  username: string;
  role: "student" | "professor" | "admin" | "superadmin";
  status: "pending" | "active" | "rejected"; // ✅ Added
};

// ────────────────────────────────────────────────────────────
// 2) Zod schemas
// ────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(["professor", "student", "admin"]), // ✅ allow admin too
});
export type RegisterData = z.infer<typeof registerSchema>;
export const registerResolver = zodResolver(registerSchema);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginData = z.infer<typeof loginSchema>;
export const loginResolver = zodResolver(loginSchema);

// ────────────────────────────────────────────────────────────
// 3) Context type
// ────────────────────────────────────────────────────────────
interface AuthContextType {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;

  register: (data: RegisterData) => Promise<SelectUser>;
  login: (data: LoginData) => Promise<SelectUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ────────────────────────────────────────────────────────────
// 4) The AuthProvider
// ────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<SelectUser | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchProfile(u: SBUser): Promise<SelectUser> {
    if (!u.email) throw new Error("Supabase user has no email");

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, full_name, role, status") // ✅ added status
        .eq("id", u.id)
        .single();

      if (error || !profile) {
        throw new Error(error?.message || "Profile not found for user.");
      }

      return {
        id: u.id,
        email: u.email,
        username: profile.username!,
        fullName: profile.full_name!,
        role: profile.role as SelectUser["role"],
        status: profile.status as SelectUser["status"], // ✅ include status
      };
    } catch (err) {
      console.error("Error fetching profile:", err);
      throw err instanceof Error ? err : new Error("Unknown error");
    }
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessErr }) => {
        if (sessErr && mounted) {
          setError(sessErr);
        } else if (data.session?.user && mounted) {
          fetchProfile(data.session.user)
            .then((u) => mounted && setUser(u))
            .catch((err) => mounted && setError(err as Error));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        if (session?.user) {
          fetchProfile(session.user)
            .then((u) => setUser(u))
            .catch((err) => setError(err as Error));
        } else {
          setUser(null);
        }
      }
    );
    const subscription = (data as any).subscription;

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // ────────────────────────────────────────────────────────────
  // 5) React-Query mutations
  // ────────────────────────────────────────────────────────────

  const registerMutation = useMutation<SelectUser, Error, RegisterData>({
    mutationFn: async (formData: RegisterData) => {
      const { data: sData, error: sErr } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (sErr) throw sErr;

      const u = sData.user!;
      const { error: pErr } = await supabase.from("profiles").insert({
        id: u.id,
        username: formData.username,
        full_name: formData.fullName,
        email: formData.email,
        role: formData.role,
        status: formData.role === "admin" ? "pending" : "active", // ✅ admins default to pending
      });
      if (pErr) throw pErr;

      return fetchProfile(u);
    },
    onSuccess: (u) => {
      setUser(u);
      toast({
        title: "Registration successful",
        description:
          u.role === "admin"
            ? "Waiting for SuperAdmin approval."
            : `Welcome, ${u.fullName}!`,
      });
    },
    onError: (err) => {
      toast({
        title: "Registration failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation<SelectUser, Error, LoginData>({
    mutationFn: async (formData: LoginData) => {
      const { data: lData, error: lErr } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      if (lErr) throw lErr;
      return fetchProfile(lData.user!);
    },
    onSuccess: (u) => {
      setUser(u);
      toast({
        title: "Login successful",
        description:
          u.status !== "active"
            ? "Your account is not active yet."
            : `Welcome back, ${u.fullName}!`,
      });
    },
    onError: (err) => {
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      const { error: outErr } = await supabase.auth.signOut();
      if (outErr) throw outErr;
    },
    onSuccess: () => {
      setUser(null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    },
    onError: (err) => {
      toast({
        title: "Logout failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ────────────────────────────────────────────────────────────
// 7) Hook
// ────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

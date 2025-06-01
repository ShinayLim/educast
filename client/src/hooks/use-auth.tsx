import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getQueryFn, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export type SelectUser = {
  id: string;
  email: string;
  fullName: string;
  username: string;
  role: "student" | "professor";
};

// After:
export type LoginData = {
  username: string
  password: string
}


export const registerSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  email: z.string().email(),
  fullName: z.string().min(2),
  role: z.enum(["professor", "student"]),
});

export type RegisterData = z.infer<typeof registerSchema>;
export const registerResolver = zodResolver(registerSchema);

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const loginResolver = zodResolver(loginSchema);

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

async function registerUser(data: RegisterData): Promise<SelectUser> {
  const { email, password, fullName, username, role } = data;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) throw signUpError;

  const user = signUpData.user;

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user?.id,
    full_name: fullName,
    username,
    role,
  });

  if (profileError) throw profileError;

  return {
    id: user?.id!,
    email,
    fullName,
    username,
    role,
  };
}

async function loginUser(data: LoginData): Promise<SelectUser> {
  const { username, password } = data;

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: username,
    password,
  });

  if (loginError) throw loginError;

  const user = loginData.user;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) throw profileError;

  return {
    id: user.id,
    email: user.email!,
    fullName: profile.full_name,
    username: profile.username,
    role: profile.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to EduCast, ${user.fullName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

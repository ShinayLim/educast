import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import supabase from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function loginAdmin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // Step 1: Try logging in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error("Invalid email or password");

  // Step 2: Check if profile exists
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", data.user?.id)
    .single();

  if (profileError || !profile) {
    // user exists in auth but not in profiles table
    await supabase.auth.signOut();
    throw new Error("No admin profile found. Please sign up as admin.");
  }

  // Step 3: Check role and status
  if (profile.role !== "admin") {
    await supabase.auth.signOut();
    throw new Error("This account is not an admin.");
  }

  if (profile.status === "pending") {
    await supabase.auth.signOut();
    throw new Error("Your admin account is pending SuperAdmin approval.");
  }

  if (profile.status === "rejected") {
    await supabase.auth.signOut();
    throw new Error("Your admin account has been rejected.");
  }

  return profile;
}

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: () => {
      navigate("/admin/dashboard");
    },
    onError: (err: any) => {
      alert(err.message);
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Admin Login
          </h2>

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={() => mutation.mutate({ email, password })}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Logging in..." : "Login"}
          </Button>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Don’t have an account?{" "}
            <Link
              href="/admin/signup"
              className="text-indigo-600 dark:text-indigo-400"
            >
              Sign up as Admin
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

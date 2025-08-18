import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import supabase from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function signupAdmin({
  username,
  full_name,
  email,
  password,
}: {
  username: string;
  full_name: string;
  email: string;
  password: string;
}) {
  // Step 1: Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Step 2: Insert profile with role = admin, status = pending
  if (data.user) {
    const { error: insertError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        full_name,
        email,
        username,
        role: "admin",
        status: "pending",
      },
    ]);

    if (insertError) throw insertError;

    // Step 3: Immediately sign out to prevent auto-login
    await supabase.auth.signOut();
  }

  return data;
}

export default function AdminSignup() {
  const [, navigate] = useLocation();
  const [full_name, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: signupAdmin,
    onSuccess: () => {
      alert("Signup successful! Your account is pending SuperAdmin approval.");
      navigate("/admin/login");
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
            Admin Signup
          </h2>

          <Input
            placeholder="Full Name"
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
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
            onClick={() =>
              mutation.mutate({ full_name, username, email, password })
            }
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Signing up..." : "Sign Up as Admin"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

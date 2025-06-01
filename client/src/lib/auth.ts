// lib/auth.ts
import { supabase } from "./supabase";
import { RegisterData, LoginData } from "@/hooks/use-auth";

export async function registerUser(data: RegisterData) {
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
    id: user?.id,
    email,
    fullName,
    username,
    role,
  };
}

export async function loginUser(data: LoginData) {
  const { username, password } = data;

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: username, // assuming username == email
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
    ...profile,
    email: user.email,
  };
}

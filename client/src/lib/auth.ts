// client/src/lib/auth.ts
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
  if (!user) throw new Error("User not returned after sign-up");

  const { error: profileError } = await supabase.from("profiles").insert({
    id: user.id,
    email,
    full_name: fullName,
    username,
  });

  if (profileError) throw profileError;

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: user.id,
    role,
  });

  if (roleError) throw roleError;

  return {
    email,
    fullName,
    username,
    role,
  };
}

export async function loginUser(data: LoginData) {
  const { email, password } = data;

  const { data: loginData, error: loginError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (loginError) throw loginError;
  const user = loginData.user;
  if (!user) throw new Error("No user returned after login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username, full_name")
    .eq("id", user.id)
    .single();

  if (profileError) throw profileError;

  const { data: roleRow, error: roleErr } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleErr) throw roleErr;

  return {
    id: user.id,
    email: user.email,
    fullName: profile.full_name,
    username: profile.username,
    role: roleRow.role,
  };
}

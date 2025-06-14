// client/src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// THESE MUST MATCH your .env keys (exactly)
const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DEBUG: log them so you can see in the browser console
console.log("🏓 supabase env:", { supabaseUrl, supabaseAnonKey });

if (!supabaseUrl) {
  throw new Error("🚨 Missing VITE_SUPABASE_URL in import.meta.env");
}
if (!supabaseAnonKey) {
  throw new Error("🚨 Missing VITE_SUPABASE_ANON_KEY in import.meta.env");
}

// Now this will only run if both are real, non-empty strings:
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

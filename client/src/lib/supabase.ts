// supabase.ts - compatible fix for Vite (frontend)

import { createClient } from "@supabase/supabase-js";

// Fix: import.meta.env only works when running Vite (frontend)
// If you run this file in Node (Express), there is no import.meta.env
// So use fallback to process.env for SSR / Node support

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;

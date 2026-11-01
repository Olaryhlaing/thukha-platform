import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* Browser Supabase client. Returns null when the env vars are not
   set, so every page keeps working (guest mode) without Supabase —
   login/signup pages show a clear "not connected yet" message
   instead of crashing. Never put the service_role key here. */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

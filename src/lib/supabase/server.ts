import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

/* Server-only helpers. The service_role key bypasses RLS, so it must
   never reach the browser — only API routes import this file. */

export function getServiceSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/* Verify a browser access token (from supabase.auth.getSession())
   and return the user, or null. Uses the anon key, never service_role. */
export async function getUserFromToken(
  authToken: string | undefined,
): Promise<User | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon || !authToken) return null;
  const client = createClient(url, anon, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await client.auth.getUser(authToken);
  if (error || !data.user) return null;
  return data.user;
}

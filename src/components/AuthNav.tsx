"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

/* Header auth state. Guest (no Supabase env, or not logged in) sees
   Login / Signup links; a logged-in customer sees their email and
   a Logout button. Session lives in the browser via supabase-js. */
export default function AuthNav() {
  const [email, setEmail] = useState<string | null>(null);
  // No Supabase env => nothing to load, so start loaded.
  const [loaded, setLoaded] = useState(() => !supabaseConfigured());

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setLoaded(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user.email ?? null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!loaded) return null;
  if (!supabaseConfigured()) {
    return (
      <Link href="/login" className="min-h-[44px] flex items-center text-thukha-violet">
        Login
      </Link>
    );
  }
  if (!email) {
    return (
      <>
        <Link href="/login" className="min-h-[44px] flex items-center text-thukha-violet">
          Login
        </Link>
        <Link href="/signup" className="min-h-[44px] flex items-center text-thukha-violet">
          Signup
        </Link>
      </>
    );
  }
  return (
    <>
      <span className="min-h-[44px] flex items-center text-sm text-thukha-indigo/70">
        {email}
      </span>
      <button
        type="button"
        onClick={async () => {
          await getSupabase()?.auth.signOut();
          setEmail(null);
        }}
        className="min-h-[44px] rounded-full border-2 border-thukha-violet px-4 py-1 text-sm font-bold text-thukha-violet"
      >
        Logout
      </button>
    </>
  );
}

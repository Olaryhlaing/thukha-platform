"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

/* Header auth state + role separation. Guest (no Supabase env, or
   not logged in) sees Login / Signup links; a logged-in customer
   sees their email and a Logout button; ONLY a logged-in admin sees
   the Admin link (via /api/me, server-side role check). The old
   layout showed Admin to everyone, including guests and customers,
   which mixed the two sides in the UI even though /admin itself
   already returned 403 for customers. Session lives in the browser
   via supabase-js. */
export default function AuthNav() {
  const { t } = useLanguage();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  // No Supabase env => nothing to load, so start loaded.
  const [loaded, setLoaded] = useState(() => !supabaseConfigured());

  async function refreshRole(token: string | undefined) {
    if (!token) {
      setIsAdmin(false);
      return;
    }
    try {
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { role?: string };
      setIsAdmin(res.ok && json.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setLoaded(true);
      void refreshRole(data.session?.access_token);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user.email ?? null);
        void refreshRole(session?.access_token);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!loaded) return null;
  if (!supabaseConfigured()) {
    return (
      <>
        <Link href="/login" className="min-h-[44px] flex items-center text-thukha-violet dark:text-thukha-lilac">{t("nav.login")}</Link>
        <Link href="/create" className="flex min-h-[44px] items-center rounded-full bg-thukha-violet px-4 py-2 text-white hover:bg-thukha-lilac">{t("nav.start")}</Link>
      </>
    );
  }
  if (!email) {
    return (
      <>
        <Link href="/login" className="min-h-[44px] flex items-center text-thukha-violet dark:text-thukha-lilac">{t("nav.login")}</Link>
        <Link href="/signup" className="min-h-[44px] flex items-center text-thukha-violet dark:text-thukha-lilac">{t("nav.signup")}</Link>
        <Link href="/create" className="flex min-h-[44px] items-center rounded-full bg-thukha-violet px-4 py-2 text-white hover:bg-thukha-lilac">{t("nav.start")}</Link>
      </>
    );
  }
  return (
    <>
      {isAdmin && (
        <Link href="/admin" className="min-h-[44px] flex items-center text-thukha-violet dark:text-thukha-lilac">{t("nav.admin")}</Link>
      )}
      <Link href="/account" className="min-h-[44px] flex items-center text-thukha-violet dark:text-thukha-lilac">{t("nav.account")}</Link>
      <span className="min-h-[44px] flex items-center text-sm text-thukha-indigo/70 dark:text-white/70">
        {email}
      </span>
      <button
        type="button"
        onClick={async () => {
          await getSupabase()?.auth.signOut();
          setEmail(null);
          setIsAdmin(false);
        }}
        className="min-h-[44px] rounded-full border-2 border-thukha-violet px-4 py-1 text-sm font-bold text-thukha-violet dark:text-thukha-lilac"
      >{t("nav.logout")}</button>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

export default function AuthNav() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState<string | null>(null);
  // Header shows the account NAME, not the email (owner request
  // 2026-11-03, screenshot circled the email pill). Source:
  // profiles.display_name from /api/me first, then the signup
  // name in Supabase Auth metadata, then the email prefix —
  // never blank, and never the full email if a name exists.
  const [displayName, setDisplayName] = useState<string | null>(null);
  // Profile picture from /api/me (same call as the role) — the
  // header shows the picture next to the name when one exists.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(() => !supabaseConfigured());

  async function refreshRole(token: string | undefined) {
    if (!token) {
      setIsAdmin(false);
      setDisplayName(null);
      setAvatarUrl(null);
      return;
    }
    try {
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { role?: string; display_name?: string | null; avatar_url?: string | null };
      setIsAdmin(res.ok && json.role === "admin");
      if (res.ok && json.display_name) setDisplayName(json.display_name);
      if (res.ok) setAvatarUrl(json.avatar_url ?? null);
    } catch {
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      const metaName = data.session?.user.user_metadata?.display_name as string | undefined;
      if (metaName) setDisplayName(metaName);
      const metaAvatar = data.session?.user.user_metadata?.avatar_url as string | undefined;
      if (metaAvatar) setAvatarUrl(metaAvatar);
      setLoaded(true);
      void refreshRole(data.session?.access_token);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user.email ?? null);
        const metaName = session?.user.user_metadata?.display_name as string | undefined;
        if (metaName) setDisplayName(metaName);
        else if (!session) setDisplayName(null);
        const metaAvatar = session?.user.user_metadata?.avatar_url as string | undefined;
        if (metaAvatar) setAvatarUrl(metaAvatar);
        else if (!session) setAvatarUrl(null);
        void refreshRole(session?.access_token);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!loaded) return null;

  if (!supabaseConfigured()) {
    return (
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
        <Link
          href="/login"
          className="flex min-h-[40px] items-center rounded-xl px-3 py-1.5 text-thukha-violet transition-all duration-200 hover:bg-thukha-violet/10 hover:scale-105 active:scale-95 dark:text-thukha-lilac dark:hover:bg-white/10"
        >
          {t("nav.login")}
        </Link>
        <Link
          href="/create"
          className="colorful-btn-gradient shimmer-hover flex min-h-[40px] items-center justify-center rounded-full px-5 py-2 text-sm font-bold shadow-md"
        >
          {t("nav.start")}
        </Link>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
        <Link
          href="/login"
          className="flex min-h-[40px] items-center rounded-xl px-3 py-1.5 text-thukha-violet transition-all duration-200 hover:bg-thukha-violet/10 hover:scale-105 active:scale-95 dark:text-thukha-lilac dark:hover:bg-white/10"
        >
          {t("nav.login")}
        </Link>
        <Link
          href="/signup"
          className="flex min-h-[40px] items-center rounded-xl px-3 py-1.5 text-thukha-violet transition-all duration-200 hover:bg-thukha-violet/10 hover:scale-105 active:scale-95 dark:text-thukha-lilac dark:hover:bg-white/10"
        >
          {t("nav.signup")}
        </Link>
        <Link
          href="/create"
          className="colorful-btn-gradient shimmer-hover flex min-h-[40px] items-center justify-center rounded-full px-5 py-2 text-sm font-bold shadow-md"
        >
          {t("nav.start")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      {isAdmin && (
        <Link
          href="/admin"
          className="flex min-h-[40px] items-center rounded-xl px-3 py-1.5 font-bold text-amber-500 transition-all duration-200 hover:bg-amber-500/10 hover:scale-105 active:scale-95 dark:text-amber-400"
        >
          {t("nav.admin")}
        </Link>
      )}
      <button
        type="button"
        onClick={async () => {
          await getSupabase()?.auth.signOut();
          setEmail(null);
          setDisplayName(null);
          setAvatarUrl(null);
          setIsAdmin(false);
          router.push("/login");
        }}
        className="flex min-h-[40px] items-center justify-center rounded-full border border-thukha-violet/40 bg-transparent px-4 py-1 text-xs font-bold text-thukha-violet transition-all duration-200 hover:border-rose-400 hover:bg-rose-500/10 hover:text-rose-500 hover:scale-105 active:scale-95 sm:text-sm dark:border-thukha-lilac/40 dark:text-thukha-lilac dark:hover:border-rose-400 dark:hover:text-rose-400"
      >
        {t("nav.logout")}
      </button>
      {/* Profile pill — 2026-11-04 owner request: this pill (avatar +
          name) is the Account link now, so the separate "Account"
          text link is removed. It is rendered LAST in AuthNav, and
          SiteHeader puts AuthNav after the toggles on desktop, so
          this pill sits at the far right end of the screen. */}
      <Link
        href="/account"
        className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-thukha-lilac/30 bg-white/40 px-3 py-1 text-xs font-medium text-thukha-indigo/80 backdrop-blur-sm transition-all duration-200 hover:bg-thukha-violet/10 hover:scale-105 active:scale-95 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <span className="pulsing-dot h-2 w-2 rounded-full bg-emerald-400" />
        )}
        <span className="max-w-[160px] truncate sm:max-w-[220px]">
          {displayName ?? email.split("@")[0] ?? email}
        </span>
      </Link>
    </div>
  );
}

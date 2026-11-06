"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

/* Admin link, rendered separately in the CENTER nav (SiteHeader).
   2026-11-04 owner request: after the pill moved to the far right,
   the Admin link moved right with it — the owner wants Admin back
   in the center, next to Create/Designs, while the pill stays far
   right. So AuthNav no longer renders Admin itself; SiteHeader
   renders this component in the center nav, and it shows only for
   admins (same /api/me role check AuthNav uses). */
export function AdminNavLink() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as { role?: string };
        if (res.ok && json.role === "admin") setIsAdmin(true);
      } catch {
        // Not admin, or not logged in — render nothing.
      }
    });
  }, []);
  if (!isAdmin) return null;
  return (
    <Link
      href="/admin"
      className="flex min-h-[40px] items-center rounded-xl px-3 py-1.5 font-bold text-amber-500 transition-all duration-200 hover:bg-amber-500/10 hover:scale-105 active:scale-95 dark:text-amber-400"
    >
      {t("nav.admin")}
    </Link>
  );
}

/* Support link, rendered in the CENTER nav (SiteHeader). Shows for
   customers and guests (guests can read the FAQ) — admins never see
   it, because they answer tickets on /admin, not on /support. */
export function SupportNavLink() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as { role?: string };
        if (res.ok && json.role === "admin") setIsAdmin(true);
      } catch {
        // Not admin, or not logged in — the link stays visible.
      }
    });
  }, []);
  if (isAdmin) return null;
  return (
    <Link
      href="/support"
      className="flex min-h-[40px] items-center rounded-xl px-3 py-1.5 text-thukha-violet transition-all duration-200 hover:bg-thukha-violet/10 hover:text-thukha-violet hover:scale-105 active:scale-95 dark:text-thukha-lilac dark:hover:bg-white/10"
    >
      {t("nav.support")}
    </Link>
  );
}

/* Support Inbox tab, rendered in the CENTER nav (SiteHeader).
   Admin-only, like AdminNavLink — it opens /admin/support, the
   dedicated inbox page. It is a header tab, NOT a button inside
   the dashboard. */
export function AdminSupportNavLink() {
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as { role?: string };
        if (res.ok && json.role === "admin") setIsAdmin(true);
      } catch {
        // Not admin, or not logged in — render nothing.
      }
    });
  }, []);
  if (!isAdmin) return null;
  return (
    <Link
      href="/admin/support"
      className="flex min-h-[40px] items-center rounded-xl px-3 py-1.5 text-thukha-violet transition-all duration-200 hover:bg-thukha-violet/10 hover:text-thukha-violet hover:scale-105 active:scale-95 dark:text-thukha-lilac dark:hover:bg-white/10"
    >
      {t("nav.supportInbox")}
    </Link>
  );
}

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
  const [loaded, setLoaded] = useState(() => !supabaseConfigured());

  async function refreshRole(token: string | undefined) {
    if (!token) {
      setDisplayName(null);
      setAvatarUrl(null);
      return;
    }
    try {
      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { role?: string; display_name?: string | null; avatar_url?: string | null };
      // Role is no longer read here — AdminNavLink checks it for
      // the center nav. This call only needs name + avatar.
      if (res.ok && json.display_name) setDisplayName(json.display_name);
      if (res.ok) setAvatarUrl(json.avatar_url ?? null);
    } catch {
      // Keep the previous name/avatar on a failed refresh.
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
      {/* Profile pill — 2026-11-04 owner request: this pill (avatar +
          name) is the Account link now, so the separate "Account"
          text link is removed. Logout is rendered AFTER it (owner
          request, same day: Logout at the far end), so on desktop
          the order is ... Pill, Logout — Logout is the far right
          item. SiteHeader puts AuthNav after the toggles. */}
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
      <button
        type="button"
        onClick={async () => {
          await getSupabase()?.auth.signOut();
          setEmail(null);
          setDisplayName(null);
          setAvatarUrl(null);
          router.push("/login");
        }}
        className="flex min-h-[40px] items-center justify-center rounded-full border border-thukha-violet/40 bg-transparent px-4 py-1 text-xs font-bold text-thukha-violet transition-all duration-200 hover:border-rose-400 hover:bg-rose-500/10 hover:text-rose-500 hover:scale-105 active:scale-95 sm:text-sm dark:border-thukha-lilac/40 dark:text-thukha-lilac dark:hover:border-rose-400 dark:hover:text-rose-400"
      >
        {t("nav.logout")}
      </button>
    </div>
  );
}

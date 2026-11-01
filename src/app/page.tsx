"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

/* Home (/) now starts as the login page: a visitor is sent to
   /login, and a logged-in user is sent straight to their work —
   /admin for admins (strict separation: admins never land on the
   customer /create flow from here), /create for customers. The
   old hero/steps home content is gone from /; the login page
   itself carries the ThuKha summary (PlatformAbout), and
   Create stays reachable from the header. */
export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.replace("/login");
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as { role?: string };
        router.replace(res.ok && json.role === "admin" ? "/admin" : "/create");
      } catch {
        router.replace("/create");
      }
    });
  }, [router]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-10">
      <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
        {t("nav.opening")}
      </p>
    </main>
  );
}

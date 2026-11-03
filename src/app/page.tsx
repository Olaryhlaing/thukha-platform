"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 px-6 py-20">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-thukha-violet via-pink-500 to-thukha-teal opacity-70 blur-xl animate-thu-aurora-spin" style={{ animationDuration: "10s" }} />
        <Image
          src="/thukha-logo.png"
          alt="ThuKha Platform"
          width={64}
          height={64}
          className="relative h-16 w-16 rounded-2xl bg-white shadow-2xl dark:bg-[#1b1c48]"
          priority
        />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <span className="pulsing-dot h-2 w-2 rounded-full bg-emerald-400" />
          <span className="colorful-brand-gradient text-sm font-black tracking-wide uppercase">ThuKha Platform</span>
        </div>
        <p className="text-sm font-medium text-thukha-indigo/70 dark:text-white/70">
          {t("nav.opening")}
        </p>
      </div>
    </main>
  );
}

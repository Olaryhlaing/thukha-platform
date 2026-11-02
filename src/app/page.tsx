"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

/* Home (/), clean and clear like X-Panda's home style — but ThuKha
   content only, no copied X-Panda code and no new claims:
   one hero, three steps, three highlights, three buttons. No
   pricing, no payments, no video, no fake features.
   Visitors (no session) see this landing page. Logged-in users
   still go straight to their work — /admin for admins, /create
   for customers — so returning users never have to click through
   a landing page. This keeps the old home=login routing for
   logged-in users and only replaces the visitor redirect. */
export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  // No Supabase env => visitor home, so start shown (same pattern
  // as AuthNav/Account; avoids a synchronous setState in effect).
  const [showHome, setShowHome] = useState(() => !supabaseConfigured());

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        setShowHome(true);
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

  if (!showHome) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-10">
        <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
          {t("nav.opening")}
        </p>
      </main>
    );
  }

  const steps = [
    { title: t("about.step1"), text: t("home.step1Text") },
    { title: t("about.step2"), text: t("home.step2Text") },
    { title: t("about.step3"), text: t("home.step3Text") },
  ];
  const highlights = [
    { title: t("home.burmeseTitle"), text: t("home.burmeseText") },
    { title: t("home.tokenTitle"), text: t("home.tokenText") },
    { title: t("home.fastTitle"), text: t("home.fastText") },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      {/* Hero — one message, three buttons, nothing else. */}
      <section className="rounded-3xl bg-gradient-to-br from-thukha-violet to-thukha-lilac p-6 text-white shadow-xl shadow-thukha-violet/30 sm:p-10">
        <p className="text-sm font-bold text-white/80">ThuKha Platform</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-white/90">
          {t("home.heroText")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/create"
            className="flex min-h-[44px] items-center rounded-full bg-white px-6 py-3 font-bold text-thukha-violet"
          >
            {t("nav.start")}
          </Link>
          <Link
            href="/login"
            className="flex min-h-[44px] items-center rounded-full border-2 border-white/70 px-6 py-3 font-bold text-white"
          >
            {t("nav.login")}
          </Link>
          <Link
            href="/signup"
            className="flex min-h-[44px] items-center rounded-full border-2 border-white/70 px-6 py-3 font-bold text-white"
          >
            {t("nav.signup")}
          </Link>
        </div>
      </section>

      {/* Steps — three clean white cards, one line each. */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {steps.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-thukha-lilac/30 bg-white p-5 shadow-sm dark:bg-[#1b1c48]"
          >
            <h2 className="font-bold">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
              {step.text}
            </p>
          </div>
        ))}
      </section>

      {/* Highlights — three clean white cards, one line each. */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-thukha-lilac/30 bg-white p-5 shadow-sm dark:bg-[#1b1c48]"
          >
            <h2 className="font-bold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
              {item.text}
            </p>
          </div>
        ))}
      </section>

      <p className="text-center text-sm leading-6">
        <Link href="/create" className="font-bold text-thukha-violet dark:text-thukha-lilac">
          {t("about.guest")}
        </Link>
      </p>
    </main>
  );
}

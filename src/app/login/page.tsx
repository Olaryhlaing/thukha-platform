"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import PlatformAbout from "@/components/PlatformAbout";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white dark:bg-[#1b1c48] px-3 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-10 md:grid-cols-2">
        <PlatformAbout />
        <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{t("login.title")}</h1>
        <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">
          {t("common.supabaseEnvNote")} {t("login.notConnectedNote")}
        </p>
        <Link href="/create" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToCreate")}</Link>
        </div>
      </main>
    );
  }

  async function login() {
    if (!email.trim() || !password) {
      setError(t("login.errEnter"));
      return;
    }
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    const { data, error: err } = await supabase!.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err || !data.session) {
      setLoading(false);
      const msg = (err?.message ?? "").toLowerCase();
      if (msg.includes("not confirmed") || msg.includes("confirm")) {
        setError(t("login.errNotConfirmed"));
      } else if (msg.includes("too many") || msg.includes("rate")) {
        setError(t("login.errRate"));
      } else if (msg.includes("invalid")) {
        setError(t("login.errInvalid"));
      } else {
        setError(t("login.errGeneric"));
      }
      return;
    }
    // Unified login: one login page for everyone. The split is
    // by the account's role (server-side, from /api/me), not by
    // a separate admin login page — admin accounts go to /admin,
    // customer accounts go to /create, from the same email/password.
    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
    const json = (await res.json()) as { role?: string };
    setLoading(false);
    router.push(res.ok && json.role === "admin" ? "/admin" : "/create");
  }

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-10 md:grid-cols-2">
      <PlatformAbout />
      <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t("login.title")}</h1>
      <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
        {t("login.intro")}
      </p>
      <label className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
        {t("common.email")}
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
        {t("common.password")}
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={`${inputClass} mt-1`} />
      </label>
      {error && <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">{error}</p>}
      <button type="button" onClick={login} disabled={loading} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
        {loading ? t("login.loading") : t("login.title")}
      </button>
      <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
        {t("login.noAccount")} <Link href="/signup" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("login.signupLink")}</Link>
      </p>
      <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
        {t("login.forgotQ")} <Link href="/forgot-password" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("login.forgotLink")}</Link>
      </p>
      </div>
    </main>
  );
}

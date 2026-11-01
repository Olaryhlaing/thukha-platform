"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white dark:bg-[#1b1c48] px-3 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

/* Forgot password: type the account email, get a reset link.
   The link goes to /auth/reset-password (set explicitly here,
   never relying on Supabase's default Site URL). The success
   message is deliberately generic — it never says whether the
   email has an account, so nobody can probe for registered emails. */
export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">{t("forgot.title")}</h1>
        <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">
          {t("common.supabaseEnvNote")} {t("forgot.notConnectedNote")}
        </p>
        <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToLogin")}</Link>
      </main>
    );
  }

  async function sendReset() {
    if (!email.trim()) {
      setError(t("forgot.errEmail"));
      return;
    }
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    const { error: err } = await supabase!.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("too many") || msg.includes("rate")) {
        setError(t("forgot.errRate"));
      } else {
        setError(t("forgot.errGeneric"));
      }
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">{t("forgot.title")}</h1>
      {sent ? (
        <>
          <p className="rounded-xl bg-teal-50 dark:bg-teal-950 p-4 text-sm leading-6 text-teal-900 dark:text-teal-100 ring-1 ring-teal-300 dark:ring-teal-800">
            {t("forgot.sent")}
          </p>
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
            {t("forgot.notArrived")} <button type="button" onClick={() => setSent(false)} className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("forgot.resend")}</button>
            {" · "}
            <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToLogin")}</Link>
          </p>
        </>
      ) : (
        <>
          <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
            {t("forgot.intro")}
          </p>
          <label className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={`${inputClass} mt-1`} />
          </label>
          {error && <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">{error}</p>}
          <button type="button" onClick={sendReset} disabled={loading} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
            {loading ? t("forgot.sending") : t("forgot.send")}
          </button>
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
            {t("forgot.remembered")} <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.loginLink")}</Link>
          </p>
        </>
      )}
    </main>
  );
}

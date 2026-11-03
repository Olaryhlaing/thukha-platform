"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/40 bg-white/90 dark:bg-[#1b1c48]/90 px-3.5 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none transition-all duration-200 focus:border-thukha-violet focus:ring-4 focus:ring-thukha-violet/20 focus:shadow-[0_0_15px_rgba(89,70,237,0.25)]";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="rounded-3xl border border-thukha-lilac/30 bg-white/70 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-thukha-indigo/70">
          <h1 className="text-3xl font-black">{t("forgot.title")}</h1>
          <p className="mt-3 leading-7 text-thukha-indigo/70 dark:text-white/70">
            {t("common.supabaseEnvNote")} {t("forgot.notConnectedNote")}
          </p>
          <Link href="/login" className="colorful-btn-gradient shimmer-hover mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-2.5 font-bold text-white shadow-md">
            {t("common.goToLogin")} →
          </Link>
        </div>
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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="flex flex-col gap-5 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-thukha-violet/10 px-3 py-1 text-xs font-bold text-thukha-violet dark:bg-white/10 dark:text-thukha-lilac">
            🔑 Account Recovery
          </span>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            <span className="colorful-text-gradient">{t("forgot.title")}</span>
          </h1>
        </div>

        {sent ? (
          <div className="anim-scale-in space-y-4">
            <p className="rounded-2xl border border-teal-300 bg-teal-50 p-4 text-sm leading-6 text-teal-900 shadow-sm dark:border-teal-800 dark:bg-teal-950/80 dark:text-teal-200">
              ✓ {t("forgot.sent")}
            </p>
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
              {t("forgot.notArrived")}{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal"
              >
                {t("forgot.resend")}
              </button>
              {" · "}
              <Link
                href="/login"
                className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal"
              >
                {t("common.goToLogin")}
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-thukha-indigo/70 dark:text-white/70">
              {t("forgot.intro")}
            </p>
            <label className="text-xs font-bold uppercase tracking-wider text-thukha-indigo dark:text-[#f6f7fb]">
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="name@company.com"
                className={`${inputClass} mt-1`}
              />
            </label>
            {error && (
              <p className="anim-scale-in rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-sm text-rose-900 shadow-sm dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200">
                ⚠️ {error}
              </p>
            )}
            <button
              type="button"
              onClick={sendReset}
              disabled={loading}
              className="colorful-btn-gradient shimmer-hover min-h-[46px] rounded-xl px-6 py-3 font-bold text-white shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("forgot.sending")}
                </span>
              ) : (
                `${t("forgot.send")} →`
              )}
            </button>
            <p className="border-t border-thukha-lilac/20 pt-3 text-center text-sm text-thukha-indigo/70 dark:border-white/10 dark:text-white/70">
              {t("forgot.remembered")}{" "}
              <Link
                href="/login"
                className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal"
              >
                {t("common.loginLink")}
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/40 bg-white/90 dark:bg-[#1b1c48]/90 px-3.5 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none transition-all duration-200 focus:border-thukha-violet focus:ring-4 focus:ring-thukha-violet/20 focus:shadow-[0_0_15px_rgba(89,70,237,0.25)]";

function ResetInner() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [phase, setPhase] = useState<"working" | "form" | "done" | "error">(
    supabaseConfigured() ? "working" : "error",
  );
  const [error, setError] = useState(
    supabaseConfigured() ? "" : t("common.supabaseNotConnected"),
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const code = searchParams.get("code");
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashError = hash.get("error_description") ?? searchParams.get("error_description");
    if (hashError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("error");
      const lower = hashError.toLowerCase();
      setError(
        lower.includes("expired")
          ? t("reset.errExpired")
          : t("reset.errInvalid"),
      );
      return;
    }
    (async () => {
      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code);
        if (err) {
          setPhase("error");
          setError(t("reset.errExpiredOrInvalid"));
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setPhase("form");
      } else {
        setPhase("error");
        setError(t("reset.errNoSession"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function updatePassword() {
    if (password.length < 8) {
      setError(t("reset.errMin"));
      return;
    }
    if (password !== confirm) {
      setError(t("reset.errMatch"));
      return;
    }
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    const { error: err } = await supabase!.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("same") || msg.includes("different")) {
        setError(t("reset.errSame"));
      } else if (msg.includes("weak") || msg.includes("short")) {
        setError(t("reset.errWeak"));
      } else {
        setError(t("reset.errGeneric"));
      }
      return;
    }
    await supabase!.auth.signOut();
    setPhase("done");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="flex flex-col gap-5 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-thukha-violet/10 px-3 py-1 text-xs font-bold text-thukha-violet dark:bg-white/10 dark:text-thukha-lilac">
            🔒 Secure Password Update
          </span>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            <span className="colorful-text-gradient">{t("reset.title")}</span>
          </h1>
        </div>

        {phase === "working" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-thukha-violet border-t-transparent shadow-lg" />
            <p className="text-sm font-semibold text-thukha-indigo/70 dark:text-white/70">{t("reset.checking")}</p>
          </div>
        )}

        {phase === "form" && (
          <>
            <p className="text-sm leading-relaxed text-thukha-indigo/70 dark:text-white/70">
              {t("reset.intro")}
            </p>
            <label className="text-xs font-bold uppercase tracking-wider text-thukha-indigo dark:text-[#f6f7fb]">
              {t("reset.new")}
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-thukha-indigo dark:text-[#f6f7fb]">
              {t("reset.newAgain")}
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type="password"
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
              onClick={updatePassword}
              disabled={loading}
              className="colorful-btn-gradient shimmer-hover min-h-[46px] rounded-xl px-6 py-3 font-bold text-white shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("reset.updating")}
                </span>
              ) : (
                `${t("reset.update")} →`
              )}
            </button>
          </>
        )}

        {phase === "done" && (
          <div className="anim-scale-in space-y-4">
            <p className="rounded-2xl border border-teal-300 bg-teal-50 p-4 text-sm leading-6 text-teal-900 shadow-sm dark:border-teal-800 dark:bg-teal-950/80 dark:text-teal-200">
              ✓ {t("reset.done")}
            </p>
            <Link
              href="/login"
              className="colorful-btn-gradient shimmer-hover inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-6 py-2.5 font-bold text-white shadow-md"
            >
              {t("common.goToLogin")} →
            </Link>
          </div>
        )}

        {phase === "error" && (
          <div className="anim-scale-in space-y-4">
            <p className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm leading-6 text-rose-900 shadow-sm dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200">
              ⚠️ {error}
            </p>
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
              <Link href="/forgot-password" className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal">
                {t("reset.newLink")}
              </Link>
              {" · "}
              <Link href="/login" className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal">
                {t("common.loginLink")}
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AuthResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-6 py-16">
          <p className="text-sm font-semibold text-thukha-indigo/70 dark:text-white/70">{t("reset.checking")}</p>
        </main>
      }
    >
      <ResetInner />
    </Suspense>
  );
}

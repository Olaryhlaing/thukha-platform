"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white dark:bg-[#1b1c48] px-3 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

/* Reset-password landing page. The email link carries a recovery
   session in one of two shapes (same as /auth/confirm):
   - ?code=… (PKCE): exchange it for a session explicitly.
   - #access_token=…&type=recovery (hash): supabase-js auto-detects
     it, so a getSession check finds the session.
   Only with a session can the new password be set — without one
   the page shows an expired/invalid error with a next step, never
   a form that silently fails. After a successful update the user
   is signed out, so they log in fresh with the new password. */
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
      // One-time auth-link decision, not a render loop.
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
    // Auth-link processing runs once on load; re-running it on a
    // language switch would re-exchange the same link.
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
    // Recovery sessions must not linger: sign out so the next
    // login uses the new password like a normal login.
    await supabase!.auth.signOut();
    setPhase("done");
  }

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">{t("reset.title")}</h1>
        <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">{t("common.supabaseNotConnected")}</p>
        <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToLogin")}</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">{t("reset.title")}</h1>
      {phase === "working" && (
        <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">{t("reset.checking")}</p>
      )}
      {phase === "form" && (
        <>
          <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
            {t("reset.intro")}
          </p>
          <label className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
            {t("reset.new")}
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
            {t("reset.newAgain")}
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" className={`${inputClass} mt-1`} />
          </label>
          {error && <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">{error}</p>}
          <button type="button" onClick={updatePassword} disabled={loading} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
            {loading ? t("reset.updating") : t("reset.update")}
          </button>
        </>
      )}
      {phase === "done" && (
        <>
          <p className="rounded-xl bg-teal-50 dark:bg-teal-950 p-4 text-sm leading-6 text-teal-900 dark:text-teal-100 ring-1 ring-teal-300 dark:ring-teal-800">
            {t("reset.done")}
          </p>
          <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToLogin")}</Link>
        </>
      )}
      {phase === "error" && (
        <>
          <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm leading-6 text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">{error}</p>
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
            <Link href="/forgot-password" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("reset.newLink")}</Link>
            {" · "}
            <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.loginLink")}</Link>
          </p>
        </>
      )}
    </main>
  );
}

export default function AuthResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<main className="mx-auto flex w-full max-w-md flex-1 px-6 py-10"><p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("reset.checking")}</p></main>}>
      <ResetInner />
    </Suspense>
  );
}

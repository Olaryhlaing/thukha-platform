"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import PlatformAbout from "@/components/PlatformAbout";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white dark:bg-[#1b1c48] px-3 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

/* Signup, X-Panda-style careful, but adapted for ThuKha (a public
   SaaS, not a private team): X-Panda needs a full name, a password
   of at least 8, and a clear pending state instead of a silent
   auto-login. ThuKha does NOT copy X-Panda's invitation code or
   admin-approval gate — any customer may sign up directly.
   Email confirmation is explicit, not left to Supabase's default
   Site URL: signUp sets emailRedirectTo to /auth/confirm, and
   that page exchanges the link (code or hash token) for a session
   and sends the customer to /create. If Confirm email is OFF in
   Supabase, signUp returns a session at once and goes to /create. */
export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-10 md:grid-cols-2">
        <PlatformAbout />
        <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{t("signup.title")}</h1>
        <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">
          {t("common.supabaseEnvNote")} {t("signup.notConnectedNote")}
        </p>
        <Link href="/create" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToCreate")}</Link>
        </div>
      </main>
    );
  }

  async function signup() {
    if (!name.trim()) {
      setError(t("signup.errName"));
      return;
    }
    if (!email.trim()) {
      setError(t("signup.errEmail"));
      return;
    }
    if (password.length < 8) {
      setError(t("signup.errPasswordMin"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("signup.errPasswordMatch"));
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    const supabase = getSupabase();
    const { data, error: err } = await supabase!.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name.trim() },
        // Explicit confirmation destination — never rely on the
        // Supabase default, which may point at localhost / a wrong
        // domain. /auth/confirm handles code + hash links.
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);
    if (err) {
      const msg = (err.message ?? "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        setError(t("signup.errExists"));
      } else if (msg.includes("password")) {
        setError(t("signup.errWeak"));
      } else if (msg.includes("sign up") || msg.includes("signup") || msg.includes("not allowed")) {
        setError(t("signup.errDisabled"));
      } else if (msg.includes("email")) {
        setError(t("signup.errInvalidEmail"));
      } else {
        setError(t("signup.errGeneric"));
      }
      return;
    }
    if (!data.session) {
      // Supabase Auth "Confirm email" is ON: no session yet, the
      // customer must click the emailed link first. Show the
      // pending card (X-Panda style) instead of a one-line note.
      setPending(true);
      return;
    }
    router.push("/create");
  }

  async function resend() {
    const supabase = getSupabase();
    if (!supabase) return;
    setResending(true);
    setError("");
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setResending(false);
    if (err) {
      setError(t("signup.errResend"));
    } else {
      setMessage(t("signup.msgResent"));
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-10 md:grid-cols-2">
      <PlatformAbout />
      <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">{t("signup.title")}</h1>
      {pending ? (
        <div className="flex flex-col gap-4 rounded-2xl bg-amber-50 dark:bg-amber-950 p-6 ring-1 ring-amber-300 dark:ring-amber-800">
          <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">{t("signup.pendingTitle")}</h2>
          <p className="text-sm leading-6 text-amber-900 dark:text-amber-100">
            <b>{email}</b> {t("signup.pendingText")}
          </p>
          <ol className="flex flex-col gap-2 text-sm leading-6 text-amber-900 dark:text-amber-100">
            <li>{t("signup.pendingStep1")}</li>
            <li>{t("signup.pendingStep2")}</li>
            <li>{t("signup.pendingStep3")}</li>
          </ol>
          {error && <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">{error}</p>}
          {message && <p className="rounded-xl bg-teal-50 dark:bg-teal-950 p-4 text-sm leading-6 text-teal-900 dark:text-teal-100 ring-1 ring-teal-300 dark:ring-teal-800">{message}</p>}
          <button type="button" onClick={resend} disabled={resending} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
            {resending ? t("signup.resending") : t("signup.resend")}
          </button>
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
            {t("signup.afterConfirm")} <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.loginLink")}</Link>
          </p>
        </div>
      ) : (
        <>
          <label className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
            {t("signup.name")}
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
            {t("signup.passwordMin")}
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-bold text-thukha-indigo dark:text-[#f6f7fb]">
            {t("signup.passwordAgain")}
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className={`${inputClass} mt-1`} />
          </label>
          {error && <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">{error}</p>}
          {message && <p className="rounded-xl bg-teal-50 dark:bg-teal-950 p-4 text-sm leading-6 text-teal-900 dark:text-teal-100 ring-1 ring-teal-300 dark:ring-teal-800">{message}</p>}
          <button type="button" onClick={signup} disabled={loading} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
            {loading ? t("signup.loading") : t("signup.title")}
          </button>
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
            {t("signup.hasAccount")} <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.loginLink")}</Link>
          </p>
        </>
      )}
      </div>
    </main>
  );
}

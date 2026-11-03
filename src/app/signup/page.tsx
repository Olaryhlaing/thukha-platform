"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import PlatformAbout from "@/components/PlatformAbout";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/40 bg-white/90 dark:bg-[#1b1c48]/90 px-3.5 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none transition-all duration-200 focus:border-thukha-violet focus:ring-4 focus:ring-thukha-violet/20 focus:shadow-[0_0_15px_rgba(89,70,237,0.25)]";

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [rawError, setRawError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-10 md:grid-cols-2">
        <PlatformAbout />
        <div className="flex flex-col justify-center gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/70 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
          <h1 className="text-3xl font-black">{t("signup.title")}</h1>
          <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">
            {t("common.supabaseEnvNote")} {t("signup.notConnectedNote")}
          </p>
          <Link href="/create" className="colorful-btn-gradient flex min-h-[44px] items-center justify-center rounded-full font-bold text-white shadow-md">
            {t("common.goToCreate")}
          </Link>
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
    // Client-side format check FIRST: if this fails, the format
    // really is wrong. If it passes and Supabase still returns an
    // "email" error, the cause is NOT the format — it is rate
    // limiting or confirmation-email sending, and the old code
    // lied about it by always mapping any "email" error to
    // errInvalidEmail (that is what the hlaingolary@gmail.com
    // screenshot showed, even though that address is well-formed).
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t("signup.errInvalidEmail"));
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
    setRawError("");
    setMessage("");
    const supabase = getSupabase();
    const { data, error: err } = await supabase!.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);
    if (err) {
      const msg = (err.message ?? "").toLowerCase();
      // Show the real Supabase message too, so the next screenshot
      // tells us the actual cause instead of a guessed translation.
      setRawError(err.message ?? "");
      if (msg.includes("already") || msg.includes("registered")) {
        setError(t("signup.errExists"));
      } else if (msg.includes("password")) {
        setError(t("signup.errWeak"));
      } else if (msg.includes("sign up") || msg.includes("signup") || msg.includes("not allowed")) {
        setError(t("signup.errDisabled"));
      } else if (msg.includes("rate limit") || msg.includes("too many")) {
        setError(t("signup.errRateLimit"));
      } else if (msg.includes("sending") || msg.includes("confirmation") || msg.includes("smtp") || msg.includes("send")) {
        setError(t("signup.errSend"));
      } else if (msg.includes("invalid") && msg.includes("email")) {
        setError(t("signup.errInvalidEmail"));
      } else {
        setError(t("signup.errGeneric"));
      }
      return;
    }
    if (!data.session) {
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
    <main className="mx-auto grid w-full max-w-4xl gap-8 px-4 py-8 sm:py-12 md:grid-cols-2">
      <PlatformAbout />
      <div className="flex flex-col gap-5 rounded-3xl border border-thukha-lilac/30 bg-white/70 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-thukha-violet/10 px-3 py-1 text-xs font-bold text-thukha-violet dark:bg-white/10 dark:text-thukha-lilac">
            🚀 Join ThuKha
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            <span className="colorful-text-gradient">{t("signup.title")}</span>
          </h1>
        </div>

        {pending ? (
          <div className="anim-scale-in flex flex-col gap-4 rounded-2xl border border-amber-300/60 bg-amber-500/10 p-6">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <span className="pulsing-dot h-2.5 w-2.5 rounded-full bg-amber-500" />
              <h2 className="text-lg font-bold">{t("signup.pendingTitle")}</h2>
            </div>
            <p className="text-sm leading-6 text-amber-900 dark:text-amber-100">
              <b>{email}</b> {t("signup.pendingText")}
            </p>
            <ol className="flex flex-col gap-2 text-sm leading-6 text-amber-900/90 dark:text-amber-100/90">
              <li>{t("signup.pendingStep1")}</li>
              <li>{t("signup.pendingStep2")}</li>
              <li>{t("signup.pendingStep3")}</li>
            </ol>
            {error && (
              <p className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-xl border border-teal-300 bg-teal-50 p-3.5 text-sm leading-6 text-teal-900 dark:border-teal-800 dark:bg-teal-950/80 dark:text-teal-200">
                {message}
              </p>
            )}
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="colorful-btn-gradient shimmer-hover min-h-[44px] rounded-full px-6 py-3 font-bold text-white shadow-md disabled:opacity-50"
            >
              {resending ? t("signup.resending") : t("signup.resend")}
            </button>
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
              {t("signup.afterConfirm")}{" "}
              <Link href="/login" className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal">
                {t("common.loginLink")}
              </Link>
            </p>
          </div>
        ) : (
          <>
            <label className="text-xs font-bold uppercase tracking-wider text-thukha-indigo dark:text-[#f6f7fb]">
              {t("signup.name")}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Business or Owner Name"
                className={`${inputClass} mt-1`}
              />
            </label>
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
            <label className="text-xs font-bold uppercase tracking-wider text-thukha-indigo dark:text-[#f6f7fb]">
              {t("signup.passwordMin")}
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-thukha-indigo dark:text-[#f6f7fb]">
              {t("signup.passwordAgain")}
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                className={`${inputClass} mt-1`}
              />
            </label>
            {error && (
              <p className="anim-scale-in rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-sm text-rose-900 shadow-sm dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200">
                ⚠️ {error}
              </p>
            )}
            {rawError && (
              <p className="break-words text-xs text-thukha-indigo/60 dark:text-white/60">
                Supabase: {rawError}
              </p>
            )}
            {message && (
              <p className="anim-scale-in rounded-xl border border-teal-300 bg-teal-50 p-3.5 text-sm leading-6 text-teal-900 shadow-sm dark:border-teal-800 dark:bg-teal-950/80 dark:text-teal-200">
                ✓ {message}
              </p>
            )}
            <button
              type="button"
              onClick={signup}
              disabled={loading}
              className="colorful-btn-gradient shimmer-hover min-h-[46px] rounded-xl px-6 py-3 font-bold text-white shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  {t("signup.loading")}
                </span>
              ) : (
                `${t("signup.title")} →`
              )}
            </button>
            <p className="border-t border-thukha-lilac/20 pt-3 text-center text-sm text-thukha-indigo/70 dark:border-white/10 dark:text-white/70">
              {t("signup.hasAccount")}{" "}
              <Link href="/login" className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal">
                {t("common.loginLink")}
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

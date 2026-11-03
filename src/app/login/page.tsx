"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/40 bg-white/90 dark:bg-[#1b1c48]/90 px-4 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none transition-all duration-200 focus:border-thukha-violet focus:ring-4 focus:ring-thukha-violet/20 focus:shadow-[0_0_15px_rgba(89,70,237,0.25)]";
const labelClass =
  "text-xs font-bold uppercase tracking-wider text-thukha-indigo dark:text-[#f6f7fb]";

function HeroSide() {
  const { t } = useLanguage();
  const steps = [t("about.step1"), t("about.step2"), t("about.step3")];
  return (
    <div className="relative order-2 flex flex-col justify-between overflow-hidden border-t border-thukha-lilac/30 bg-[#ede9fe]/80 backdrop-blur-md p-8 text-thukha-indigo sm:p-12 md:order-1 md:w-1/2 md:border-r md:border-t-0 dark:border-white/10 dark:bg-thukha-indigo/90 dark:text-white">
      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <span className="pulsing-dot h-2.5 w-2.5 rounded-full bg-thukha-teal" />
          <p className="text-xl font-black tracking-tight text-thukha-indigo dark:text-white">ThuKha Platform</p>
        </div>
        <div className="mt-10 sm:mt-12">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-thukha-violet/30 bg-white/80 px-3.5 py-1 text-xs font-bold text-thukha-violet shadow-sm backdrop-blur-sm transition-transform hover:scale-105 dark:border-thukha-lilac/40 dark:bg-white/10 dark:text-thukha-lilac">
            <span className="h-1.5 w-1.5 rounded-full bg-thukha-violet dark:bg-thukha-lilac" />
            {t("login.heroPill")}
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {t("login.heroTitle1")} <br />
            <span className="colorful-text-gradient">{t("login.heroTitle2")}</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-thukha-indigo/80 sm:text-base dark:text-white/80">
            {t("login.heroText")}
          </p>
        </div>
      </div>

      <div className="relative z-10 my-8 space-y-3.5">
        {steps.map((step, i) => (
          <div
            key={step}
            className="group flex items-center gap-3.5 rounded-2xl border border-thukha-violet/10 bg-white/60 p-2.5 text-sm font-medium text-thukha-indigo/90 backdrop-blur-sm transition-all duration-300 hover:translate-x-1.5 hover:border-thukha-violet/40 hover:bg-white/90 hover:shadow-md dark:border-white/5 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-thukha-violet to-thukha-teal text-xs font-extrabold text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
              {i + 1}
            </div>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="relative z-10 border-t border-thukha-indigo/10 pt-6 dark:border-white/10">
        <p className="text-sm font-medium leading-6 text-thukha-indigo/80 dark:text-white/80">{t("about.tokens")}</p>
        <p className="mt-2 text-xs leading-6 text-thukha-indigo/60 dark:text-white/60">{t("login.heroQuote")}</p>
      </div>

      {/* Colorful Animated Ambient Glows */}
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-thukha-violet/30 via-pink-500/20 to-thukha-teal/20 blur-3xl animate-thu-aurora-spin"
        style={{ animationDuration: "25s" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-gradient-to-tr from-thukha-teal/25 via-thukha-blue/20 to-thukha-lilac/25 blur-3xl animate-thu-float"
        style={{ animationDuration: "10s" }}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
    const json = (await res.json()) as { role?: string };
    setLoading(false);
    router.push(res.ok && json.role === "admin" ? "/admin" : "/create");
  }

  return (
    <main className="flex flex-1 flex-col md:flex-row">
      <HeroSide />
      <div className="order-1 flex items-center justify-center p-6 sm:p-12 md:order-2 md:w-1/2">
        <div className="w-full max-w-md space-y-7 rounded-3xl border border-thukha-lilac/25 bg-white/70 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-thukha-violet/10 px-3 py-1 text-xs font-bold text-thukha-violet dark:bg-white/10 dark:text-thukha-lilac">
              ✨ Sign in to workspace
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              {t("login.welcome")}
            </h2>
            <p className="mt-1 text-sm text-thukha-indigo/70 dark:text-white/70">
              {t("login.welcomeText")}
            </p>
          </div>

          {!supabaseConfigured() ? (
            <div className="space-y-4 rounded-2xl border border-amber-300/40 bg-amber-500/10 p-4">
              <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">
                {t("common.supabaseEnvNote")} {t("login.notConnectedNote")}
              </p>
              <Link href="/create" className="font-bold text-thukha-violet dark:text-thukha-lilac">
                {t("common.goToCreate")}
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="anim-scale-in flex items-center gap-2 rounded-xl border border-rose-300/60 bg-rose-50/90 p-3.5 text-sm text-rose-900 shadow-sm dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  login();
                }}
              >
                <div>
                  <label htmlFor="login-email" className={labelClass}>
                    {t("common.email")}
                  </label>
                  <input
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="name@company.com"
                    className={`${inputClass} mt-1.5`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className={labelClass}>
                      {t("common.password")}
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal"
                    >
                      {t("login.forgotLink")}
                    </Link>
                  </div>
                  <input
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                    className={`${inputClass} mt-1.5`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="colorful-btn-gradient shimmer-hover mt-3 min-h-[46px] w-full rounded-xl px-6 py-3 text-base font-bold text-white shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {t("login.loading")}
                    </span>
                  ) : (
                    <span>{t("login.title")} →</span>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="space-y-2 border-t border-thukha-lilac/20 pt-4 text-center text-sm dark:border-white/10">
            <p className="text-thukha-indigo/70 dark:text-white/70">
              {t("login.noAccount")}{" "}
              <Link href="/signup" className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal">
                {t("login.signupLink")}
              </Link>
            </p>
            <p>
              <Link href="/create" className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal">
                {t("about.guest")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

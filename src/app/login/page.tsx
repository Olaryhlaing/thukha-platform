"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white dark:bg-[#1b1c48] px-4 py-3 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none transition-all focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";
const labelClass =
  "text-xs font-bold uppercase tracking-wider text-thukha-indigo dark:text-[#f6f7fb]";

/* Login page in X-Panda's UI style (layout idea only — original
   ThuKha code, ThuKha colours, no X-Panda code copied):
   full-width split — left dark hero, right white form, stacked
   on mobile. The left hero carries the same settled facts the
   old PlatformAbout card carried (steps, token note, guest
   link), so nothing a new visitor needs is lost in the redesign.
   Signup still uses PlatformAbout, so that component stays. */
function HeroSide() {
  const { t } = useLanguage();
  const steps = [t("about.step1"), t("about.step2"), t("about.step3")];
  return (
    <div className="relative flex flex-col justify-between overflow-hidden border-b border-white/10 bg-thukha-indigo p-8 text-white sm:p-12 md:w-1/2 md:border-b-0 md:border-r">
      <div className="relative z-10">
        <p className="text-xl font-bold">ThuKha Platform</p>
        <div className="mt-12">
          <span className="inline-flex items-center rounded-full border border-thukha-lilac/50 bg-white/10 px-3 py-1 text-xs font-bold text-thukha-lilac">
            {t("login.heroPill")}
          </span>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {t("login.heroTitle1")} <br />
            <span className="text-thukha-lilac">{t("login.heroTitle2")}</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
            {t("login.heroText")}
          </p>
        </div>
      </div>

      <div className="relative z-10 my-8 space-y-4">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-3 text-sm text-white/90">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-thukha-lilac/50 bg-white/10 font-bold text-thukha-lilac">
              {i + 1}
            </div>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="relative z-10 border-t border-white/10 pt-6">
        <p className="text-sm leading-6 text-white/80">{t("about.tokens")}</p>
        <p className="mt-3 text-xs leading-6 text-white/60">{t("login.heroQuote")}</p>
      </div>

      {/* Background glows, ThuKha violet/lilac like X-Panda's teal glows. */}
      <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-thukha-violet/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-thukha-lilac/20 blur-3xl" />
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
    <main className="flex flex-1 flex-col md:flex-row">
      <HeroSide />
      {/* Dark mode: form side is also Midnight Indigo (the hero
          colour), not the lighter #1b1c48 surface — otherwise
          the dark login page still looks two-toned and the
          previous body-only change is barely visible. Inputs
          keep #1b1c48, so they stand out on the indigo form. */}
      <div className="flex items-center justify-center bg-white p-8 dark:bg-thukha-indigo sm:p-12 md:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("login.welcome")}
            </h2>
            <p className="mt-2 text-sm text-thukha-indigo/70 dark:text-white/70">
              {t("login.welcomeText")}
            </p>
          </div>

          {!supabaseConfigured() ? (
            <div className="space-y-4">
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
                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:ring-amber-800">
                  {error}
                </p>
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
                      className="text-xs font-bold text-thukha-violet dark:text-thukha-lilac"
                    >
                      {t("login.forgotLink")}
                    </Link>
                  </div>
                  <input
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className={`${inputClass} mt-1.5`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 min-h-[44px] w-full rounded-xl bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50"
                >
                  {loading ? t("login.loading") : `${t("login.title")} →`}
                </button>
              </form>
            </>
          )}

          <div className="space-y-2 pt-2 text-center text-sm">
            <p className="text-thukha-indigo/70 dark:text-white/70">
              {t("login.noAccount")}{" "}
              <Link href="/signup" className="font-bold text-thukha-violet dark:text-thukha-lilac">
                {t("login.signupLink")}
              </Link>
            </p>
            <p>
              <Link href="/create" className="font-bold text-thukha-violet dark:text-thukha-lilac">
                {t("about.guest")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

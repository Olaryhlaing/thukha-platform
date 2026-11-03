"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

function ConfirmInner() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "done" | "error">(
    supabaseConfigured() ? "working" : "error",
  );
  const [error, setError] = useState(
    supabaseConfigured() ? "" : t("common.supabaseNotConnected"),
  );

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const code = searchParams.get("code");
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashError = hash.get("error_description") ?? searchParams.get("error_description");
    if (hashError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      const lower = hashError.toLowerCase();
      if (lower.includes("expired")) {
        setError(t("confirm.errExpired"));
      } else {
        setError(t("confirm.errInvalid"));
      }
      return;
    }
    (async () => {
      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code);
        if (err) {
          setStatus("error");
          setError(t("confirm.errExpiredOrInvalid"));
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStatus("done");
        router.replace("/create");
      } else {
        setStatus("error");
        setError(t("confirm.errNoSession"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-thukha-indigo/70">
        <h1 className="text-2xl font-black sm:text-3xl">
          <span className="colorful-text-gradient">{t("confirm.title")}</span>
        </h1>

        {status === "working" && (
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-thukha-violet border-t-transparent shadow-lg" />
            <p className="text-sm font-semibold text-thukha-indigo/70 dark:text-white/70">{t("confirm.working")}</p>
          </div>
        )}

        {status === "done" && (
          <div className="anim-scale-in flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-2xl text-white shadow-lg">
              ✓
            </div>
            <p className="text-sm font-semibold text-thukha-indigo/80 dark:text-white/80">{t("confirm.done")}</p>
          </div>
        )}

        {status === "error" && (
          <div className="anim-scale-in space-y-4">
            <p className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm leading-6 text-rose-900 shadow-sm dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200">
              ⚠️ {error}
            </p>
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
              <Link href="/signup" className="font-bold text-thukha-violet transition-colors hover:text-thukha-teal dark:text-thukha-lilac dark:hover:text-thukha-teal">
                {t("common.goToSignup")}
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

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmInner />
    </Suspense>
  );
}

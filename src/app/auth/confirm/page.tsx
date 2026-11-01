"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

/* Email-confirmation landing page. Supabase sends one of two link
   shapes, and both must work or confirmation silently fails:
   - ?code=… (PKCE): exchange it for a session explicitly.
   - #access_token=…&type=signup (hash): supabase-js auto-detects
     it on client creation, so a getSession check finds the session.
   Errors are shown in Burmese with a next step (resend / login),
   never a blank page. On success the customer goes to /create —
   the same place a no-confirmation signup goes. */
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
      // One-time auth-link decision, not a render loop.
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
      // Hash links (and exchanged codes) land here as a session.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStatus("done");
        router.replace("/create");
      } else {
        setStatus("error");
        setError(t("confirm.errNoSession"));
      }
    })();
    // Auth-link processing runs once on load; re-running it on a
    // language switch would re-exchange the same link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">{t("confirm.title")}</h1>
        <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">{t("common.supabaseNotConnected")}</p>
        <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToLogin")}</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">{t("confirm.title")}</h1>
      {status === "working" && (
        <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">{t("confirm.working")}</p>
      )}
      {status === "done" && (
        <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">{t("confirm.done")}</p>
      )}
      {status === "error" && (
        <>
          <p className="rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm leading-6 text-amber-900 dark:text-amber-100 ring-1 ring-amber-300 dark:ring-amber-800">{error}</p>
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
            <Link href="/signup" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToSignup")}</Link>
            {" · "}
            <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.loginLink")}</Link>
          </p>
        </>
      )}
    </main>
  );
}

export default function AuthConfirmPage() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<main className="mx-auto flex w-full max-w-md flex-1 px-6 py-10"><p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("confirm.working")}</p></main>}>
      <ConfirmInner />
    </Suspense>
  );
}

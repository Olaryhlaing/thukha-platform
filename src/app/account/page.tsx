"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

/* My account: who I am, my token balance, and — privacy — a way to
   delete everything myself. Two steps on purpose: the first button
   only reveals the warning, the second button actually deletes.
   After a successful delete the session is signed out and the user
   is sent to /login; there is no "undo", and the page says so. */
export default function AccountPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  // No Supabase env => nothing to load, so start loaded (same
  // pattern as AuthNav; avoids a synchronous setState in effect).
  const [loaded, setLoaded] = useState(() => !supabaseConfigured());
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) {
        setLoaded(true);
        return;
      }
      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as {
          email?: string;
          role?: string;
          balance?: number | null;
        };
        if (res.ok) {
          setEmail(json.email ?? null);
          setRole(json.role ?? "");
          setBalance(json.balance ?? null);
        }
      } catch {
        // Leave the not-logged-in branch below.
      }
      setLoaded(true);
    });
  }, []);

  async function deleteAccount() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    setDeleting(true);
    setMessage("");
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setMessage(t("account.deleteFailed"));
        setDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      setMessage(t("account.deleteDone"));
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setMessage(t("account.deleteFailed"));
      setDeleting(false);
    }
  }

  if (!loaded) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <p>{t("account.loading")}</p>
      </main>
    );
  }
  if (!email) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <h1 className="text-2xl font-bold">{t("account.title")}</h1>
        <p className="mt-4 leading-7">
          {t("account.notLoggedIn")}{" "}
          <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">
            {t("nav.login")}
          </Link>
        </p>
      </main>
    );
  }
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-bold">{t("account.title")}</h1>
      <div className="mt-6 flex flex-col gap-2 rounded-3xl bg-white dark:bg-[#1b1c48] p-6 ring-1 ring-thukha-lilac/30">
        <p>
          <b>{t("account.email")}:</b> {email}
        </p>
        <p>
          <b>{t("account.role")}:</b> {role}
        </p>
        <p>
          <b>{t("account.balance")}:</b>{" "}
          {role === "admin" ? "∞ Unlimited (Admin)" : balance ?? "—"}
        </p>
        <p className="mt-2 text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
          <Link href="/privacy" className="font-bold text-thukha-violet dark:text-thukha-lilac">
            {t("nav.privacy")}
          </Link>
        </p>
      </div>
      <section className="mt-6 rounded-3xl bg-red-50 dark:bg-red-950 p-6 ring-1 ring-red-200 dark:ring-red-800">
        <h2 className="text-lg font-bold text-red-900 dark:text-red-100">
          {t("account.deleteTitle")}
        </h2>
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-4 min-h-[44px] rounded-full bg-red-600 px-6 py-2 font-bold text-white"
          >
            {t("account.deleteButton")}
          </button>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-red-900 dark:text-red-100">
              {t("account.deleteWarning")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting}
                className="min-h-[44px] rounded-full bg-red-600 px-6 py-2 font-bold text-white disabled:opacity-50"
              >
                {deleting ? t("account.deleting") : t("account.deleteConfirm")}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="min-h-[44px] rounded-full border-2 border-red-600 px-6 py-2 font-bold text-red-700 dark:text-red-200 disabled:opacity-50"
              >
                {t("account.deleteCancel")}
              </button>
            </div>
          </>
        )}
        {message && <p className="mt-4 text-sm leading-6">{message}</p>}
      </section>
    </main>
  );
}

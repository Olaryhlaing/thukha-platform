"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { serverErrorText } from "@/lib/i18n";

/* Admin Audit Log — a dedicated page (moved out of the /admin
   dashboard on 2026-11-10). Admin-only: non-admins are sent away.
   Shows the latest 100 audit entries (who did what, to whom, when). */
type AuditLog = {
  id: string;
  actor_id: string | null;
  action: string;
  target_id: string | null;
  detail: string | null;
  created_at?: string;
  actor_name: string | null;
  target_name: string | null;
};

export default function AdminAuditPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function loadLogs() {
    const supabase = getSupabase();
    if (!supabase) return;
    const token = (await supabase.auth.getSession())?.data.session?.access_token;
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const mres = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mjson = (await mres.json()) as { role?: string };
      if (!mres.ok || mjson.role !== "admin") {
        router.replace("/create");
        return;
      }
    } catch {
      router.replace("/create");
      return;
    }
    try {
      const res = await fetch("/api/admin/audit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { logs?: AuditLog[]; error?: string };
      if (!res.ok) {
        setError(serverErrorText(lang, json.error) ?? t("admin.errRead"));
        return;
      }
      setLogs(json.logs ?? []);
    } catch {
      setError(t("admin.errRead"));
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin"
          className="w-fit text-sm font-bold text-thukha-violet transition-colors hover:text-thukha-violet/70 dark:text-thukha-lilac"
        >
          ← {t("support.backToAdmin")}
        </Link>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          <span className="colorful-text-gradient">{t("admin.auditTitle")}</span>
        </h1>
      </div>

      {error ? (
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
      ) : !loaded ? (
        <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("common.loading")}</p>
      ) : (
        <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
          {logs.length === 0 ? (
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("admin.auditEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {logs.map((l) => (
                <li key={l.id} className="rounded-xl bg-white/60 p-3 text-sm dark:bg-black/20">
                  <p className="font-bold">{l.action}</p>
                  <p className="text-xs text-thukha-indigo/60 dark:text-white/60">
                    {l.actor_name ?? l.actor_id ?? "—"} → {l.target_name ?? l.target_id ?? "—"}
                    {l.detail ? ` • ${l.detail}` : ""}
                    {l.created_at ? ` • ${new Date(l.created_at).toLocaleString(lang === "my" ? "my-MM" : "en-GB")}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

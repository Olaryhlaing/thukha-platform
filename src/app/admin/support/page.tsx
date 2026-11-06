"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { serverErrorText } from "@/lib/i18n";

/* Admin Support Inbox — a dedicated page where the admin answers
   customer tickets directly. The reply section used to live inside
   the admin dashboard (/admin); it moved here on 2026-11-06 so the
   dashboard stays for stats/users/health only. Admin-only: non-admins
   are sent away. A resolved ticket is locked — no replying again. */
type Ticket = {
  id: string;
  owner_id: string;
  owner_name: string | null;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  admin_reply: string | null;
  created_at: string;
};

export default function AdminSupportPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});
  const [ticketMessage, setTicketMessage] = useState("");
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function loadTickets() {
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
      const res = await fetch("/api/admin/support", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { tickets?: Ticket[]; error?: string };
      if (!res.ok) {
        setError(serverErrorText(lang, json.error) ?? t("support.adminFailed"));
        return;
      }
      setTickets(json.tickets ?? []);
    } catch {
      setError(t("support.adminFailed"));
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function replyTicket(id: string, status: "in_progress" | "resolved") {
    const reply = (ticketReplies[id] ?? "").trim();
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) return;
    try {
      const res = await fetch("/api/admin/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, admin_reply: reply, status }),
      });
      if (!res.ok) {
        setTicketMessage(t("support.adminFailed"));
        return;
      }
      setTicketMessage(t("support.adminSaved"));
      setTickets((prev) => prev.map((tk) => (tk.id === id ? { ...tk, admin_reply: reply, status } : tk)));
    } catch {
      setTicketMessage(t("support.adminFailed"));
    }
  }

  const openCount = tickets.filter((tk) => tk.status !== "resolved").length;

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
          <span className="colorful-text-gradient">{t("support.adminTitle")}</span>
        </h1>
        {loaded && (
          <p className="text-sm font-bold text-thukha-indigo/70 dark:text-white/70">
            {t("support.adminOpenCount", { count: String(openCount) })}
          </p>
        )}
      </div>

      {error ? (
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
      ) : !loaded ? (
        <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("common.loading")}</p>
      ) : (
        <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
          {ticketMessage && <p className="text-sm font-semibold">{ticketMessage}</p>}
          {tickets.length === 0 ? (
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("support.adminEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {tickets.map((tk) => (
                <li key={tk.id} className="rounded-2xl border border-thukha-lilac/25 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-thukha-indigo dark:text-white">{tk.subject}</p>
                    <span className="rounded-full bg-thukha-violet/10 px-3 py-1 text-xs font-bold text-thukha-violet dark:text-thukha-lilac">
                      {tk.status === "in_progress" ? t("support.statusInProgress") : tk.status === "resolved" ? t("support.statusResolved") : t("support.statusOpen")}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-thukha-indigo/70 dark:bg-black/20 dark:text-white/70">{tk.category}</span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-thukha-violet dark:text-thukha-lilac">
                    {tk.owner_name ?? tk.owner_id.slice(0, 8)} • {new Date(tk.created_at).toLocaleString(lang === "my" ? "my-MM" : "en-GB")}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-thukha-indigo/80 dark:text-white/80">{tk.message}</p>
                  {tk.admin_reply && (
                    <p className="mt-2 rounded-xl bg-thukha-violet/5 p-3 text-sm leading-6 dark:bg-white/5">
                      <b>{t("support.adminReply")}:</b> {tk.admin_reply}
                    </p>
                  )}
                  {tk.status === "resolved" && (
                    <p className="mt-2 rounded-xl bg-teal-50 p-3 text-sm font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-200">
                      ✓ {t("support.adminResolvedLocked")}
                    </p>
                  )}
                  <label className="mt-3 flex flex-col gap-1 text-sm font-bold">
                    {t("support.adminReplyLabel")}
                    <textarea
                      value={ticketReplies[tk.id] ?? tk.admin_reply ?? ""}
                      onChange={(e) => setTicketReplies((prev) => ({ ...prev, [tk.id]: e.target.value }))}
                      placeholder={t("support.adminReplyPlaceholder")}
                      rows={2}
                      maxLength={2000}
                      disabled={tk.status === "resolved"}
                      className="rounded-xl border border-thukha-lilac/40 bg-white px-3 py-2 text-sm outline-none disabled:opacity-60 dark:bg-thukha-indigo"
                    />
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button type="button" onClick={() => replyTicket(tk.id, "in_progress")} disabled={tk.status === "resolved"} className="colorful-btn-gradient shimmer-hover min-h-[38px] rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-md disabled:opacity-50 sm:text-sm">
                      {t("support.adminSave")}
                    </button>
                    <button type="button" onClick={() => replyTicket(tk.id, "resolved")} disabled={tk.status === "resolved"} className="inline-flex min-h-[38px] items-center rounded-xl bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-800 disabled:opacity-50 dark:bg-teal-950/60 dark:text-teal-200">
                      ✓ {t("support.adminMarkResolved")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

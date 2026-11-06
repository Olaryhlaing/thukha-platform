"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { serverErrorText } from "@/lib/i18n";

type Ticket = {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  admin_reply: string | null;
  created_at: string;
};

const CATEGORIES = ["token", "image", "download", "account", "payment", "other"] as const;

export default function SupportPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [category, setCategory] = useState<string>("token");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [sending, setSending] = useState(false);

  const faqs: [string, string][] = [
    [t("support.faq1q"), t("support.faq1a")],
    [t("support.faq2q"), t("support.faq2a")],
    [t("support.faq3q"), t("support.faq3a")],
    [t("support.faq4q"), t("support.faq4a")],
    [t("support.faq5q"), t("support.faq5a")],
    [t("support.faq6q"), t("support.faq6a")],
  ];

  async function loadTickets() {
    const supabase = getSupabase();
    if (!supabase) return;
    const token = (await supabase.auth.getSession())?.data.session?.access_token;
    if (!token) {
      setLoggedIn(false);
      return;
    }
    setLoggedIn(true);
    try {
      const mres = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mjson = (await mres.json()) as { role?: string };
      if (mres.ok) {
        const admin = mjson.role === "admin";
        setIsAdmin(admin);
        if (admin) {
          // Admins do not use this page — they answer tickets on
          // /admin/support. Send them straight there.
          router.replace("/admin/support");
          return;
        }
      }
    } catch {
      // Role check is extra — a failed check just keeps the customer view.
    }
    try {
      const res = await fetch("/api/support", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { tickets?: Ticket[] };
      if (res.ok) setTickets(json.tickets ?? []);
    } catch {
      // Tickets are extra — the FAQ still works without them.
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function statusLabel(status: Ticket["status"]) {
    if (status === "in_progress") return t("support.statusInProgress");
    if (status === "resolved") return t("support.statusResolved");
    return t("support.statusOpen");
  }

  async function submitTicket() {
    if (!subject.trim() || !message.trim()) {
      setFormMessage(t("support.failed"));
      return;
    }
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) {
      setFormMessage(t("support.loginFirst"));
      return;
    }
    setSending(true);
    setFormMessage("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category, subject: subject.trim(), message: message.trim() }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        setFormMessage(serverErrorText(lang, json.error) ?? t("support.failed"));
        return;
      }
      setFormMessage(t("support.sent"));
      setSubject("");
      setMessage("");
      await loadTickets();
    } catch {
      setFormMessage(t("support.failed"));
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-thukha-violet/30 bg-thukha-violet/10 px-3.5 py-1 text-xs font-bold text-thukha-violet dark:border-thukha-lilac/40 dark:bg-white/10 dark:text-thukha-lilac">
            <span className="pulsing-dot h-2 w-2 rounded-full bg-emerald-400" />
            {t("support.badge")}
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          <span className="colorful-text-gradient">{t("support.title")}</span>
        </h1>
        <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">{t("support.subtitle")}</p>
      </div>

      {/* Desktop: two columns — ticket form + my tickets on the
          left, FAQ on the right (sticky). Mobile: one column,
          same order. */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
      {/* Ticket form */}
      <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("support.formTitle")}</h2>
        {!supabaseConfigured() ? (
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("common.supabaseNotConnected")}</p>
        ) : !loggedIn ? (
          <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
            {t("support.loginFirst")}{" "}
            <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">
              {t("common.loginLink")} →
            </Link>
          </p>
        ) : isAdmin ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">{t("support.adminNotice")}</p>
            <Link
              href="/admin/support"
              className="colorful-btn-gradient shimmer-hover inline-flex min-h-[44px] w-fit items-center justify-center rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md"
            >
              {t("support.adminGoToInbox")} →
            </Link>
          </div>
        ) : (
          <>
            {formMessage && <p className="text-sm font-semibold">{formMessage}</p>}
            <label className="flex flex-col gap-1 text-sm font-bold">
              {t("support.category")}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-thukha-lilac/40 bg-white px-3 py-2 text-sm font-semibold outline-none dark:bg-thukha-indigo"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`support.cat${c.charAt(0).toUpperCase()}${c.slice(1)}` as never)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              {t("support.subject")}
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t("support.subjectPlaceholder")}
                maxLength={200}
                className="rounded-xl border border-thukha-lilac/40 bg-white px-3 py-2 text-sm outline-none dark:bg-thukha-indigo"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-bold">
              {t("support.message")}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("support.messagePlaceholder")}
                rows={5}
                maxLength={2000}
                className="rounded-xl border border-thukha-lilac/40 bg-white px-3 py-2 text-sm outline-none dark:bg-thukha-indigo"
              />
            </label>
            <button
              type="button"
              onClick={submitTicket}
              disabled={sending}
              className="colorful-btn-gradient shimmer-hover min-h-[44px] w-fit rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md disabled:opacity-60"
            >
              {sending ? t("support.submitting") : t("support.submit")}
            </button>
          </>
        )}
      </section>

      {/* My tickets (customers only — admins answer tickets on /admin) */}
      {loggedIn && !isAdmin && (
        <section id="tickets" className="flex scroll-mt-24 flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
          <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("support.myTickets")}</h2>
          {tickets.length === 0 ? (
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("support.empty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {tickets.map((tk) => (
                <li key={tk.id} className="rounded-2xl border border-thukha-lilac/25 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-thukha-indigo dark:text-white">{tk.subject}</p>
                    <span className="rounded-full bg-thukha-violet/10 px-3 py-1 text-xs font-bold text-thukha-violet dark:text-thukha-lilac">
                      {statusLabel(tk.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-thukha-indigo/80 dark:text-white/80">{tk.message}</p>
                  <p className="mt-1 text-xs text-thukha-indigo/60 dark:text-white/60">
                    {new Date(tk.created_at).toLocaleString(lang === "my" ? "my-MM" : "en-GB")}
                  </p>
                  <div className="mt-3 rounded-xl bg-thukha-violet/5 p-3 dark:bg-white/5">
                    <p className="text-xs font-bold text-thukha-violet dark:text-thukha-lilac">{t("support.adminReply")}</p>
                    <p className="mt-1 text-sm leading-6">{tk.admin_reply ?? t("support.noReply")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
        </div>
        <div className="min-w-0">
          <div className="lg:sticky lg:top-24">
      {/* FAQ */}
      <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("support.faqTitle")}</h2>
        <div className="flex flex-col gap-3">
          {faqs.map(([q, a]) => (
            <div key={q} className="rounded-2xl border border-thukha-lilac/25 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
              <p className="font-bold text-thukha-indigo dark:text-white">{q}</p>
              <p className="mt-1 text-sm leading-7 text-thukha-indigo/80 dark:text-white/80">{a}</p>
            </div>
          ))}
        </div>
      </section>

          </div>
        </div>
      </div>
    </main>
  );
}

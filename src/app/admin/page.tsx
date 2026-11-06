"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { serverErrorText } from "@/lib/i18n";

type Stats = {
  users: { id: string; display_name: string | null; role: string; suspended?: boolean; created_at: string }[];
  balances: { owner_id: string; balance: number }[];
  generations: { id: string; owner_id: string | null; prompt: string; model: string; format: string | null; cost_tokens: number; flagged?: boolean; created_at: string }[];
  perUser: { id: string; display_name: string | null; role: string; balance: number | null; generations: number; spent: number }[];
  counts: { users: number; brands: number; designs: number; generations: number };
};

export default function AdminPage() {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(() =>
    supabaseConfigured() ? "" : t("common.supabaseNotConnected"),
  );
  const [refillAmounts, setRefillAmounts] = useState<Record<string, string>>({});
  const [refillMessage, setRefillMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  type Health = { todayGenerations: number; todaySpent: number; totalGenerations: number; totalSpent: number; users: number; estimatedQuotaLeft: number; failuresToday?: number; failuresTotal?: number; failureRate?: number };
  const [health, setHealth] = useState<Health | null>(null);
  const [exportMessage, setExportMessage] = useState("");
  type AuditLog = { id: string; actor_id: string | null; action: string; target_id: string | null; detail: string | null; created_at?: string; actor_name: string | null; target_name: string | null };
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  type Ann = { id: string; title: string; body: string; active: boolean; created_at?: string };
  const [announcements, setAnnouncements] = useState<Ann[]>([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [adminActionMessage, setAdminActionMessage] = useState("");
  type Ticket = { id: string; owner_id: string; owner_name: string | null; category: string; subject: string; message: string; status: "open" | "in_progress" | "resolved"; admin_reply: string | null; created_at: string };
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});
  const [ticketMessage, setTicketMessage] = useState("");

  async function loadStats() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError(t("admin.errLoginFirst"));
      return;
    }
    const res = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json()) as Stats & { error?: string };
    if (!res.ok) {
      setError(serverErrorText(lang, json.error) ?? t("admin.errRead"));
      return;
    }
    setStats(json);
    try {
      const hres = await fetch("/api/admin/health", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hjson = (await hres.json()) as Health;
      if (hres.ok) setHealth(hjson);
    } catch {
      // Health is extra info — stats still work without it.
    }
    try {
      const ares = await fetch("/api/admin/audit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ajson = (await ares.json()) as { logs?: AuditLog[] };
      if (ares.ok) setAuditLogs(ajson.logs ?? []);
      const nres = await fetch("/api/admin/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const njson = (await nres.json()) as { announcements?: Ann[] };
      if (nres.ok) setAnnouncements(njson.announcements ?? []);
      const sres = await fetch("/api/admin/support", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sjson = (await sres.json()) as { tickets?: Ticket[] };
      if (sres.ok) setTickets(sjson.tickets ?? []);
    } catch {
      // Audit/announcements are extra info — stats still work.
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    loadStats();
  }, []);

  async function exportCsv(type: "users" | "generations") {
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) return;
    setExportMessage("");
    try {
      const res = await fetch(`/api/admin/export?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setExportMessage(t("admin.exportFailed"));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thukha-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportMessage(t("admin.exportFailed"));
    }
  }

  async function adminPost(path: string, body: unknown): Promise<{ ok: boolean; error?: string }> {
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) return { ok: false };
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string };
      return { ok: res.ok, error: json.error };
    } catch {
      return { ok: false };
    }
  }

  async function suspendUser(userId: string, suspended: boolean) {
    const r = await adminPost("/api/admin/suspend", { userId, suspended });
    if (!r.ok) {
      setAdminActionMessage(r.error ?? t("admin.suspendFailed"));
      return;
    }
    setAdminActionMessage("");
    setStats((prev) => prev ? { ...prev, users: prev.users.map((u) => (u.id === userId ? { ...u, suspended } : u)) } : prev);
  }

  async function flagGeneration(id: string, flagged: boolean) {
    const r = await adminPost("/api/admin/flag", { id, flagged });
    if (!r.ok) {
      setAdminActionMessage(r.error ?? t("admin.flagFailed"));
      return;
    }
    setAdminActionMessage("");
    setStats((prev) => prev ? { ...prev, generations: prev.generations.map((g) => (g.id === id ? { ...g, flagged } : g)) } : prev);
  }

  async function createAnnouncement() {
    if (!annTitle.trim() || !annBody.trim()) {
      setAnnMessage(t("admin.annFailed"));
      return;
    }
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) return;
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: annTitle, body: annBody }),
      });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !json.id) {
        setAnnMessage(json.error ?? t("admin.annFailed"));
        return;
      }
      setAnnMessage(t("admin.annCreated"));
      setAnnTitle("");
      setAnnBody("");
      setAnnouncements((prev) => [{ id: json.id as string, title: annTitle, body: annBody, active: true, created_at: new Date().toISOString() }, ...prev]);
    } catch {
      setAnnMessage(t("admin.annFailed"));
    }
  }

  async function toggleAnnouncement(id: string, active: boolean) {
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) return;
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id, active }),
      });
      if (!res.ok) {
        setAnnMessage(t("admin.annFailed"));
        return;
      }
      setAnnMessage("");
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, active } : a)));
    } catch {
      setAnnMessage(t("admin.annFailed"));
    }
  }

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

  async function refill(userId: string) {
    const amount = Math.floor(Number(refillAmounts[userId] ?? 100));
    if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
      setRefillMessage(t("admin.errAmount"));
      return;
    }
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) {
      setRefillMessage(t("admin.errRefillLogin"));
      return;
    }
    const res = await fetch("/api/admin/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, amount }),
    });
    const json = (await res.json()) as { balance?: number; error?: string };
    if (!res.ok || typeof json.balance !== "number") {
      setRefillMessage(serverErrorText(lang, json.error) ?? t("admin.errRefill"));
      return;
    }
    setStats((prev) =>
      prev
        ? {
            ...prev,
            balances: [
              ...prev.balances.filter((b) => b.owner_id !== userId),
              { owner_id: userId, balance: json.balance as number },
            ],
          }
        : prev,
    );
    setRefillMessage(t("admin.refillDone", { amount, balance: json.balance }));
  }

  async function deleteGeneration(id: string) {
    if (!window.confirm(t("admin.deleteConfirm"))) {
      return;
    }
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) {
      setDeleteMessage(t("admin.errDeleteLogin"));
      return;
    }
    const res = await fetch("/api/admin/generations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setDeleteMessage(serverErrorText(lang, json.error) ?? t("admin.errDelete"));
      return;
    }
    setStats((prev) =>
      prev
        ? {
            ...prev,
            generations: prev.generations.filter((g) => g.id !== id),
            counts: { ...prev.counts, generations: Math.max(0, prev.counts.generations - 1) },
          }
        : prev,
    );
    setDeleteMessage(t("admin.deleteDone"));
  }

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-12">
        <div className="rounded-3xl border border-rose-300/60 bg-rose-500/10 p-8 text-center backdrop-blur-xl">
          <h1 className="text-3xl font-black">Admin Panel</h1>
          <p className="mt-3 text-base font-medium text-rose-800 dark:text-rose-200">{error}</p>
          <Link
            href="/login"
            className="colorful-btn-gradient shimmer-hover mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-2.5 font-bold text-white shadow-md"
          >
            {t("common.goToLogin")} →
          </Link>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-amber-500 border-t-transparent shadow-lg" />
        <p className="text-sm font-semibold text-thukha-indigo/70 dark:text-white/70">{t("common.loading")}</p>
      </main>
    );
  }

  const balanceOf = (id: string) =>
    stats.balances.find((b) => b.owner_id === id)?.balance ?? "—";
  const nameOf = (ownerId: string | null) => {
    if (!ownerId) return "—";
    return (
      stats.perUser.find((p) => p.id === ownerId)?.display_name ??
      stats.users.find((u) => u.id === ownerId)?.display_name ??
      ownerId.slice(0, 8)
    );
  };
  const perUserOf = (id: string) =>
    stats.perUser.find((p) => p.id === id);

  const STAT_CARDS = [
    { label: t("admin.users"), value: stats.counts.users, icon: "👥", color: "from-purple-500 to-indigo-600" },
    { label: t("admin.brands"), value: stats.counts.brands, icon: "🏷️", color: "from-pink-500 to-rose-600" },
    { label: t("admin.designs"), value: stats.counts.designs, icon: "🎨", color: "from-blue-500 to-cyan-600" },
    { label: t("admin.generations"), value: stats.counts.generations, icon: "⚡", color: "from-teal-400 to-emerald-600" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300">
            <span className="pulsing-dot h-2 w-2 rounded-full bg-amber-500" />
            Admin Operations Center
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          <span className="colorful-text-gradient">{t("admin.title")}</span>
        </h1>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STAT_CARDS.map((card, idx) => (
          <div
            key={card.label}
            className={`gradient-border-top interactive-card relative overflow-hidden rounded-3xl border border-thukha-lilac/30 bg-white/75 p-5 text-center shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-thukha-indigo/70 stagger-${idx + 1}`}
          >
            <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${card.color} text-lg text-white shadow-md`}>
              {card.icon}
            </div>
            <p className="text-2xl font-black text-thukha-indigo sm:text-3xl dark:text-white">{card.value}</p>
            <p className="mt-1 text-xs font-bold text-thukha-indigo/60 dark:text-white/60">{card.label}</p>
          </div>
        ))}
      </div>

      {/* System Health (Batch 1) */}
      {health && (
        <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
          <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("admin.healthTitle")}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div><p className="text-2xl font-black">{health.todayGenerations}</p><p className="text-xs font-bold text-thukha-indigo/60 dark:text-white/60">{t("admin.healthToday")}</p></div>
            <div><p className="text-2xl font-black">{health.totalGenerations}</p><p className="text-xs font-bold text-thukha-indigo/60 dark:text-white/60">{t("admin.healthTotal")}</p></div>
            <div><p className="text-2xl font-black">{health.todaySpent}</p><p className="text-xs font-bold text-thukha-indigo/60 dark:text-white/60">{t("admin.healthTodaySpent")}</p></div>
            <div><p className="text-2xl font-black">{health.estimatedQuotaLeft}</p><p className="text-xs font-bold text-thukha-indigo/60 dark:text-white/60">{t("admin.healthEstimate")}</p></div>
            <div><p className="text-2xl font-black">{health.failuresToday ?? 0}</p><p className="text-xs font-bold text-thukha-indigo/60 dark:text-white/60">{t("admin.healthFailuresToday")}</p></div>
            <div><p className="text-2xl font-black">{health.failureRate ?? 0}%</p><p className="text-xs font-bold text-thukha-indigo/60 dark:text-white/60">{t("admin.healthFailureRate")}</p></div>
          </div>
          <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">{t("admin.healthNote")}</p>
          <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">{t("admin.healthFailureNote")}</p>
        </section>
      )}

      {/* Data Export (Batch 1) */}
      <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("admin.exportTitle")}</h2>
        <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">{t("admin.exportNote")}</p>
        {exportMessage && <p className="text-sm font-semibold">{exportMessage}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => exportCsv("users")} className="colorful-btn-gradient shimmer-hover min-h-[44px] rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md">
            {t("admin.exportUsers")}
          </button>
          <button type="button" onClick={() => exportCsv("generations")} className="colorful-btn-gradient shimmer-hover min-h-[44px] rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md">
            {t("admin.exportGenerations")}
          </button>
        </div>
      </section>

      {/* Users & Token Balances */}
      <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <div>
          <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("admin.usersToken")}</h2>
          <p className="mt-1 text-sm text-thukha-indigo/70 dark:text-white/70">
            {t("admin.refillNote")}
          </p>
        </div>

        {refillMessage && (
          <div className="anim-scale-in rounded-xl border border-teal-300 bg-teal-50 p-3 text-sm font-semibold text-teal-900 shadow-sm dark:border-teal-800 dark:bg-teal-950/80 dark:text-teal-200">
            ✓ {refillMessage}
          </div>
        )}

        {stats.users.length === 0 ? (
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("admin.noUsers")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {stats.users.map((u) => (
              <li
                key={u.id}
                className="flex flex-col gap-3 rounded-2xl border border-thukha-lilac/30 bg-white/50 p-4 transition-all duration-200 hover:border-thukha-violet/40 hover:bg-white/80 sm:flex-row sm:items-center sm:justify-between dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-thukha-violet to-thukha-teal text-sm font-black text-white">
                    {(u.display_name ?? u.id).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-thukha-indigo dark:text-white">{u.display_name ?? u.id.slice(0, 8)}</p>
                    <p className="text-xs text-thukha-indigo/70 dark:text-white/70">
                      {u.role} • Token: <b className="text-thukha-violet dark:text-thukha-lilac">{balanceOf(u.id)}</b> • {t("admin.generated")} {perUserOf(u.id)?.generations ?? 0} {t("admin.images")} • {t("admin.spent")} {perUserOf(u.id)?.spent ?? 0} {t("admin.tokenUnit")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={refillAmounts[u.id] ?? "100"}
                    onChange={(e) =>
                      setRefillAmounts((prev) => ({ ...prev, [u.id]: e.target.value }))
                    }
                    aria-label={t("admin.refillAmountLabel")}
                    className="w-24 rounded-xl border border-thukha-lilac/40 bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-violet/20 dark:bg-thukha-indigo"
                  />
                  <button
                    type="button"
                    onClick={() => refill(u.id)}
                    className="colorful-btn-gradient shimmer-hover min-h-[38px] rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-md sm:text-sm"
                  >
                    {t("admin.refill")}
                  </button>
                  {u.role !== "admin" && (
                    <button
                      type="button"
                      onClick={() => suspendUser(u.id, !u.suspended)}
                      className="inline-flex min-h-[38px] items-center rounded-xl bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                    >
                      {u.suspended ? t("admin.unsuspend") : t("admin.suspend")}
                    </button>
                  )}
                  {u.suspended && (
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">{t("admin.suspendedBadge")}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Per User Breakdown */}
      <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <div>
          <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("admin.perUserTitle")}</h2>
          <p className="mt-1 text-sm text-thukha-indigo/70 dark:text-white/70">
            {t("admin.perUserNote")}
          </p>
        </div>

        {stats.perUser.length === 0 ? (
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("admin.noUsers")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {stats.perUser.map((p) => (
              <li
                key={p.id}
                className="flex flex-col gap-2 rounded-2xl border border-thukha-lilac/25 bg-white/40 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/5 dark:bg-white/5"
              >
                <div>
                  <p className="font-bold text-thukha-indigo dark:text-white">{p.display_name ?? p.id.slice(0, 8)}</p>
                  <p className="text-xs text-thukha-indigo/60 dark:text-white/60">{p.role}</p>
                </div>
                <p className="text-sm text-thukha-indigo dark:text-[#f6f7fb]">
                  {t("admin.generated")} <b>{p.generations} {t("admin.images")}</b> • {t("admin.spent")} <b>{p.spent} {t("admin.tokenUnit")}</b> •{" "}
                  {p.role === "admin" ? t("admin.balanceUnlimited") : `${t("admin.balance")} ${p.balance ?? "—"}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Latest Generations */}
      <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <div>
          <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("admin.latestGenerations")}</h2>
        </div>

        {deleteMessage && (
          <div className="anim-scale-in rounded-xl border border-teal-300 bg-teal-50 p-3 text-sm font-semibold text-teal-900 shadow-sm dark:border-teal-800 dark:bg-teal-950/80 dark:text-teal-200">
            ✓ {deleteMessage}
          </div>
        )}

        {stats.generations.length === 0 ? (
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("admin.noGenerations")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {stats.generations.map((g) => (
              <li
                key={g.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-thukha-lilac/25 bg-white/50 p-4 transition-all duration-200 hover:border-thukha-violet/30 hover:bg-white/80 sm:flex-row sm:items-center dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed">&ldquo;{g.prompt}&rdquo;</p>
                  <p className="mt-1 text-xs font-bold text-thukha-violet dark:text-thukha-lilac">
                    {t("admin.generatedBy")} {nameOf(g.owner_id)}
                  </p>
                  <p className="text-xs text-thukha-indigo/60 dark:text-white/60">
                    {g.model} • {g.format ?? "standard"} • {g.cost_tokens} token • {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                {g.flagged && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">{t("admin.flaggedBadge")}</span>
                )}
                <button
                  type="button"
                  onClick={() => flagGeneration(g.id, !g.flagged)}
                  className="inline-flex min-h-[38px] w-fit items-center justify-center rounded-xl bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-200"
                >
                  🚩 {g.flagged ? t("admin.unflag") : t("admin.flag")}
                </button>
                <button
                  type="button"
                  onClick={() => deleteGeneration(g.id)}
                  className="inline-flex min-h-[38px] w-fit items-center justify-center rounded-xl bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition-all duration-200 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white"
                >
                  🗑️ {t("common.delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Support Tickets (Customer Service) */}
      <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("support.adminTitle")}</h2>
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
                  {tk.owner_name ?? tk.owner_id.slice(0, 8)} • {new Date(tk.created_at).toLocaleString()}
                </p>
                <p className="mt-1 text-sm leading-6 text-thukha-indigo/80 dark:text-white/80">{tk.message}</p>
                {tk.admin_reply && (
                  <p className="mt-2 rounded-xl bg-thukha-violet/5 p-3 text-sm leading-6 dark:bg-white/5">
                    <b>{t("support.adminReply")}:</b> {tk.admin_reply}
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
                    className="rounded-xl border border-thukha-lilac/40 bg-white px-3 py-2 text-sm outline-none dark:bg-thukha-indigo"
                  />
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => replyTicket(tk.id, "in_progress")} className="colorful-btn-gradient shimmer-hover min-h-[38px] rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-md sm:text-sm">
                    {t("support.adminSave")}
                  </button>
                  <button type="button" onClick={() => replyTicket(tk.id, "resolved")} className="inline-flex min-h-[38px] items-center rounded-xl bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-200">
                    ✓ {t("support.adminMarkResolved")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Audit Log (Batch 2) */}
      <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("admin.auditTitle")}</h2>
        {adminActionMessage && <p className="text-sm font-semibold">{adminActionMessage}</p>}
        {auditLogs.length === 0 ? (
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("admin.auditEmpty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {auditLogs.slice(0, 50).map((l) => (
              <li key={l.id} className="rounded-xl bg-white/60 p-3 text-sm dark:bg-black/20">
                <p className="font-bold">{l.action}</p>
                <p className="text-xs text-thukha-indigo/60 dark:text-white/60">
                  {l.actor_name ?? l.actor_id ?? "—"} → {l.target_name ?? l.target_id ?? "—"}
                  {l.detail ? ` • ${l.detail}` : ""}
                  {l.created_at ? ` • ${new Date(l.created_at).toLocaleString()}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Announcements (Batch 2) */}
      <section className="flex flex-col gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("admin.annTitle")}</h2>
        {annMessage && <p className="text-sm font-semibold">{annMessage}</p>}
        <input
          type="text"
          value={annTitle}
          onChange={(e) => setAnnTitle(e.target.value)}
          placeholder={t("admin.annTitleLabel")}
          className="rounded-xl border border-thukha-lilac/40 bg-white px-3 py-2 text-sm outline-none dark:bg-thukha-indigo"
        />
        <textarea
          value={annBody}
          onChange={(e) => setAnnBody(e.target.value)}
          placeholder={t("admin.annBodyLabel")}
          rows={3}
          className="rounded-xl border border-thukha-lilac/40 bg-white px-3 py-2 text-sm outline-none dark:bg-thukha-indigo"
        />
        <button type="button" onClick={createAnnouncement} className="colorful-btn-gradient shimmer-hover min-h-[44px] w-fit rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md">
          {t("admin.annCreate")}
        </button>
        <ul className="flex flex-col gap-2">
          {announcements.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 rounded-xl bg-white/60 p-3 text-sm dark:bg-black/20 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{a.title} <span className="text-xs font-bold text-thukha-violet dark:text-thukha-lilac">{a.active ? t("admin.annActiveBadge") : t("admin.annInactiveBadge")}</span></p>
                <p className="text-thukha-indigo/70 dark:text-white/70">{a.body}</p>
              </div>
              <button type="button" onClick={() => toggleAnnouncement(a.id, !a.active)} className="inline-flex min-h-[38px] w-fit items-center rounded-xl bg-white px-4 py-1.5 text-xs font-bold dark:bg-black/20">
                {a.active ? t("admin.annDeactivate") : t("admin.annActivate")}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

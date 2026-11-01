"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { serverErrorText } from "@/lib/i18n";

type Stats = {
  users: { id: string; display_name: string | null; role: string; created_at: string }[];
  balances: { owner_id: string; balance: number }[];
  generations: { id: string; owner_id: string | null; prompt: string; model: string; format: string | null; cost_tokens: number; created_at: string }[];
  perUser: { id: string; display_name: string | null; role: string; balance: number | null; generations: number; spent: number }[];
  counts: { users: number; brands: number; designs: number; generations: number };
};

/* Admin dashboard: counts, users + token balances, and the latest
   generations. Admin-only — the API returns 403 for customers, and
   this page shows that message instead of any data. */
export default function AdminPage() {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(() =>
    supabaseConfigured() ? "" : t("common.supabaseNotConnected"),
  );
  const [refillAmounts, setRefillAmounts] = useState<Record<string, string>>({});
  const [refillMessage, setRefillMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

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
  }

  useEffect(() => {
    // loadStats sets state only after awaits (session + fetch), so
    // this is not a synchronous render loop — the lint rule cannot
    // see through the async helper, hence this suppression.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStats();
  }, []);

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
    // Remove locally only on server ok, and keep the count honest.
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
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="leading-7 text-amber-900 dark:text-amber-100">{error}</p>
        <Link href="/login" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToLogin")}</Link>
      </main>
    );
  }
  if (!stats) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p>{t("common.loading")}</p>
      </main>
    );
  }
  const balanceOf = (id: string) =>
    stats.balances.find((b) => b.owner_id === id)?.balance ?? "—";
  // Who generated a row: display name from the per-user breakdown
  // (or the users list), falling back to a short id for deleted /
  // unknown owners (generations.owner_id is SET NULL on delete).
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          [t("admin.users"), stats.counts.users],
          [t("admin.brands"), stats.counts.brands],
          [t("admin.designs"), stats.counts.designs],
          [t("admin.generations"), stats.counts.generations],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-thukha-lilac/40 p-4 text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{label}</p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">{t("admin.usersToken")}</h2>
        <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
          {t("admin.refillNote")}
        </p>
        {refillMessage && <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">{refillMessage}</p>}
        {stats.users.length === 0 ? (
          <p className="text-thukha-indigo/70 dark:text-white/70">{t("admin.noUsers")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.users.map((u) => (
              <li key={u.id} className="flex flex-col gap-3 rounded-2xl border border-thukha-lilac/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{u.display_name ?? u.id.slice(0, 8)}</p>
                  <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
                    {u.role} • Token: {balanceOf(u.id)} • {t("admin.generated")} {perUserOf(u.id)?.generations ?? 0} {t("admin.images")} • {t("admin.spent")} {perUserOf(u.id)?.spent ?? 0} {t("admin.tokenUnit")}
                  </p>
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
                    className="w-24 rounded-xl border border-thukha-lilac/50 px-3 py-2 text-base text-thukha-indigo dark:text-[#f6f7fb] outline-none focus:border-thukha-violet"
                  />
                  <button
                    type="button"
                    onClick={() => refill(u.id)}
                    className="min-h-[44px] rounded-full bg-thukha-violet px-4 py-2 text-sm font-bold text-white"
                  >
                    {t("admin.refill")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">{t("admin.perUserTitle")}</h2>
        <p className="text-sm leading-6 text-thukha-indigo/70 dark:text-white/70">
          {t("admin.perUserNote")}
        </p>
        {stats.perUser.length === 0 ? (
          <p className="text-thukha-indigo/70 dark:text-white/70">{t("admin.noUsers")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.perUser.map((p) => (
              <li key={p.id} className="flex flex-col gap-1 rounded-2xl border border-thukha-lilac/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{p.display_name ?? p.id.slice(0, 8)}</p>
                  <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{p.role}</p>
                </div>
                <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">
                  {t("admin.generated")} <b>{p.generations} {t("admin.images")}</b> • {t("admin.spent")} <b>{p.spent} {t("admin.tokenUnit")}</b> •{" "}
                  {p.role === "admin" ? t("admin.balanceUnlimited") : `${t("admin.balance")} ${p.balance ?? "—"}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">{t("admin.latestGenerations")}</h2>
        {deleteMessage && <p className="text-sm leading-6 text-thukha-indigo dark:text-[#f6f7fb]">{deleteMessage}</p>}
        {stats.generations.length === 0 ? (
          <p className="text-thukha-indigo/70 dark:text-white/70">{t("admin.noGenerations")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.generations.map((g) => (
              <li key={g.id} className="flex flex-col gap-3 rounded-2xl border border-thukha-lilac/40 p-4">
                <div>
                  <p className="leading-7">{g.prompt}</p>
                  <p className="text-sm font-bold text-thukha-violet dark:text-thukha-lilac">{t("admin.generatedBy")} {nameOf(g.owner_id)}</p>
                  <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
                    {g.model} • {g.format ?? ""} • {g.cost_tokens} token •{" "}
                    {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteGeneration(g.id)}
                  className="min-h-[44px] w-fit rounded-full border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-300"
                >
                  {t("common.delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

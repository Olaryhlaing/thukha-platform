"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(() =>
    supabaseConfigured() ? "" : "Supabase မချိတ်သေးပါ။",
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
      setError("Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။");
      return;
    }
    const res = await fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json()) as Stats & { error?: string };
    if (!res.ok) {
      setError(json.error ?? "Admin data ဖတ်လို့ မရပါ။");
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
      setRefillMessage("Amount က 1 ကနေ 10000 အတွင်း ဖြစ်ရမယ်။");
      return;
    }
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) {
      setRefillMessage("Admin login လုပ်ပြီးမှ ဖြည့်လို့ရမယ်။");
      return;
    }
    const res = await fetch("/api/admin/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, amount }),
    });
    const json = (await res.json()) as { balance?: number; error?: string };
    if (!res.ok || typeof json.balance !== "number") {
      setRefillMessage(json.error ?? "Token ဖြည့်လို့ မရပါ။");
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
    setRefillMessage(`Token ${amount} ဖြည့်ပြီးပြီ။ လက်ကျန် ${json.balance} ဖြစ်သွားပြီ။`);
  }

  async function deleteGeneration(id: string) {
    if (!window.confirm("ဒီ generation ကို တကယ် ဖျက်မလား? ပြန်ယူလို့ မရဘူး။ (Token ပြန်အမ်းမှာ မဟုတ်ဘူး — log ပဲ ဖျက်မှာ။)")) {
      return;
    }
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) {
      setDeleteMessage("Login လုပ်ပြီးမှ ဖျက်လို့ရမယ်။");
      return;
    }
    const res = await fetch("/api/admin/generations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      setDeleteMessage(json.error ?? "Generation ဖျက်လို့ မရပါ။");
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
    setDeleteMessage("Generation ဖျက်ပြီးပြီ။");
  }

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="leading-7 text-amber-900">{error}</p>
        <Link href="/login" className="font-bold text-thukha-violet">Login ကို သွားပါ →</Link>
      </main>
    );
  }
  if (!stats) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p>ဖတ်နေပါတယ်…</p>
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
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Users", stats.counts.users],
          ["Brands", stats.counts.brands],
          ["Designs", stats.counts.designs],
          ["Generations", stats.counts.generations],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-thukha-lilac/40 p-4 text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-thukha-indigo/70">{label}</p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Users + Token</h2>
        <p className="text-sm leading-6 text-thukha-indigo/70">
          Prototype အနေနဲ့ admin က user တစ်ယောက်ချင်းစီကို token ပြန်ဖြည့်ပေးလို့ရတယ်။
          အစစ်မထုတ်ခင် ဒါကို ငွေချေမှုနဲ့ အစားထိုးရမယ်။
        </p>
        {refillMessage && <p className="text-sm leading-6 text-thukha-indigo">{refillMessage}</p>}
        {stats.users.length === 0 ? (
          <p className="text-thukha-indigo/70">User မရှိသေးဘူး။</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.users.map((u) => (
              <li key={u.id} className="flex flex-col gap-3 rounded-2xl border border-thukha-lilac/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{u.display_name ?? u.id.slice(0, 8)}</p>
                  <p className="text-sm text-thukha-indigo/70">
                    {u.role} • Token: {balanceOf(u.id)} • ထုတ်ပြီး {perUserOf(u.id)?.generations ?? 0} ပုံ • ကုန်ပြီး {perUserOf(u.id)?.spent ?? 0} token
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
                    aria-label="ဖြည့်မယ့် token ပမာဏ"
                    className="w-24 rounded-xl border border-thukha-lilac/50 px-3 py-2 text-base text-thukha-indigo outline-none focus:border-thukha-violet"
                  />
                  <button
                    type="button"
                    onClick={() => refill(u.id)}
                    className="min-h-[44px] rounded-full bg-thukha-violet px-4 py-2 text-sm font-bold text-white"
                  >
                    Token ဖြည့်ပါ
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">Customer တစ်ယောက်ချင်းစီ — ဘာထုတ်ခဲ့လဲ၊ Token ဘယ်လောက်ကုန်လဲ</h2>
        <p className="text-sm leading-6 text-thukha-indigo/70">
          Token အများဆုံး ကုန်တဲ့သူ အရင်စီထားတယ်။ ထုတ်ပြီး ဆိုတာ ပုံအရေအတွက်၊
          ကုန်ပြီး ဆိုတာ အဲဒီ user စုစုပေါင်း ကုန်ခဲ့တဲ့ token (နောက်ဆုံး 20 ပုံတင်မက၊
          အားလုံးကို ပေါင်းထားတာ)။
        </p>
        {stats.perUser.length === 0 ? (
          <p className="text-thukha-indigo/70">User မရှိသေးဘူး။</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.perUser.map((p) => (
              <li key={p.id} className="flex flex-col gap-1 rounded-2xl border border-thukha-lilac/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{p.display_name ?? p.id.slice(0, 8)}</p>
                  <p className="text-sm text-thukha-indigo/70">{p.role}</p>
                </div>
                <p className="text-sm leading-6 text-thukha-indigo">
                  ထုတ်ပြီး <b>{p.generations} ပုံ</b> • ကုန်ပြီး <b>{p.spent} token</b> •{" "}
                  {p.role === "admin" ? "လက်ကျန် ∞ Unlimited" : `လက်ကျန် ${p.balance ?? "—"}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">နောက်ဆုံး Generations</h2>
        {deleteMessage && <p className="text-sm leading-6 text-thukha-indigo">{deleteMessage}</p>}
        {stats.generations.length === 0 ? (
          <p className="text-thukha-indigo/70">Generation မရှိသေးဘူး။</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.generations.map((g) => (
              <li key={g.id} className="flex flex-col gap-3 rounded-2xl border border-thukha-lilac/40 p-4">
                <div>
                  <p className="leading-7">{g.prompt}</p>
                  <p className="text-sm font-bold text-thukha-violet">ထုတ်သူ: {nameOf(g.owner_id)}</p>
                  <p className="text-sm text-thukha-indigo/70">
                    {g.model} • {g.format ?? ""} • {g.cost_tokens} token •{" "}
                    {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteGeneration(g.id)}
                  className="min-h-[44px] w-fit rounded-full border border-red-300 px-4 py-2 text-sm font-bold text-red-700"
                >
                  ဖျက်ပါ
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

type Design = {
  id: string;
  prompt: string;
  channel: string | null;
  format: string | null;
  image_url?: string | null;
  created_at?: string;
};

function readGuestDesigns(): Design[] {
  try {
    return JSON.parse(localStorage.getItem("thukha-designs") ?? "[]") as Design[];
  } catch {
    return [];
  }
}

export default function DesignsPage() {
  const { t, lang } = useLanguage();
  const [designs, setDesigns] = useState<Design[]>(() => {
    if (typeof window === "undefined" || getSupabase()) return [];
    return readGuestDesigns();
  });
  const [loggedIn, setLoggedIn] = useState(false);
  type Generation = { id: string; prompt: string; model: string; format: string | null; cost_tokens: number; created_at?: string };
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      setLoggedIn(Boolean(token));
      if (!token) return;
      const res = await fetch("/api/designs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { designs?: Design[] };
      setDesigns(json.designs ?? []);
      try {
        const gres = await fetch("/api/generations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const gjson = (await gres.json()) as { generations?: Generation[] };
        if (gres.ok) setGenerations(gjson.generations ?? []);
      } catch {
        // History is extra info — designs still work without it.
      }
    });
  }, []);

  async function deleteDesign(id: string) {
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (token) {
      const res = await fetch(`/api/designs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
    } else {
      const next = readGuestDesigns().filter((d) => d.id !== id);
      localStorage.setItem("thukha-designs", JSON.stringify(next));
    }
    setDesigns((prev) => prev.filter((d) => d.id !== id));
  }

  async function downloadSavedImage(design: Design) {
    if (!design.image_url) return;
    setDownloadingId(design.id);
    try {
      const res = await fetch(design.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thukha-design-${design.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(design.image_url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-thukha-violet/30 bg-thukha-violet/10 px-3.5 py-1 text-xs font-bold text-thukha-violet dark:border-thukha-lilac/40 dark:bg-white/10 dark:text-thukha-lilac">
            <span className="pulsing-dot h-2 w-2 rounded-full bg-thukha-teal" />
            {loggedIn ? "Saved in Cloud" : "Saved in Browser"}
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          <span className="colorful-text-gradient">My Designs</span>
        </h1>
        <p className="max-w-2xl text-base leading-7 text-thukha-indigo/70 dark:text-white/70">
          {loggedIn ? t("designs.loggedIn") : t("designs.guest")}
          <br />
          <span className="text-sm text-thukha-indigo/60 dark:text-white/60">
            {loggedIn ? t("designs.noteWithStorage") : t("designs.note")}
          </span>
        </p>
      </div>

      {designs.length === 0 ? (
        <div className="anim-scale-in relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-thukha-lilac/30 bg-white/70 p-10 text-center shadow-xl backdrop-blur-xl sm:p-14 dark:border-white/10 dark:bg-thukha-indigo/70">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-thukha-violet/20 via-pink-500/20 to-thukha-teal/20 text-4xl shadow-inner">
            <span className="anim-float">🎨</span>
            <div className="pulsing-dot absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-thukha-teal" />
          </div>
          <h2 className="text-xl font-bold text-thukha-indigo dark:text-white">
            {t("designs.empty")}
          </h2>
          <p className="max-w-md text-sm text-thukha-indigo/70 dark:text-white/70">
            စတင်ဖန်တီးပြီး သင့်လုပ်ငန်းအတွက် ကြော်ငြာ visual များကို ထုတ်လုပ်လိုက်ပါ။
          </p>
          <Link
            href="/create"
            className="colorful-btn-gradient shimmer-hover mt-2 flex min-h-[46px] items-center justify-center rounded-full px-7 py-2.5 text-base font-bold text-white shadow-lg"
          >
            {t("common.goToCreate")} →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {designs.map((d, idx) => (
            <li
              key={d.id}
              className={`gradient-border-top interactive-card group flex flex-col justify-between gap-4 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-xl sm:p-6 dark:border-white/10 dark:bg-thukha-indigo/70 stagger-${(idx % 5) + 1}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {d.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.image_url}
                    alt={d.prompt.slice(0, 60)}
                    className="h-36 w-full shrink-0 rounded-2xl object-cover shadow-md sm:h-28 sm:w-28"
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {d.channel && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-thukha-violet/10 px-3 py-1 text-xs font-bold text-thukha-violet dark:bg-white/10 dark:text-thukha-lilac">
                        📱 {d.channel}
                      </span>
                    )}
                    {d.format && (
                      <span className="rounded-full border border-thukha-lilac/30 px-2.5 py-0.5 text-xs font-medium text-thukha-indigo/60 dark:border-white/10 dark:text-white/60">
                        {d.format}
                      </span>
                    )}
                    {d.created_at && (
                      <span className="text-xs text-thukha-indigo/50 dark:text-white/50">
                        • {new Date(d.created_at).toLocaleDateString(lang === "my" ? "my-MM" : "en-GB")}
                      </span>
                    )}
                  </div>
                  <p className="text-base font-medium leading-relaxed text-thukha-indigo/90 dark:text-white/90">
                    &ldquo;{d.prompt}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 border-t border-thukha-lilac/20 pt-3 dark:border-white/10">
                {d.image_url && (
                  <button
                    type="button"
                    onClick={() => downloadSavedImage(d)}
                    disabled={downloadingId === d.id}
                    className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-teal-50 px-4 py-2 text-xs font-bold text-teal-800 transition-all duration-200 hover:bg-teal-600 hover:text-white disabled:opacity-50 sm:text-sm dark:bg-teal-950/60 dark:text-teal-200 dark:hover:bg-teal-600 dark:hover:text-white"
                  >
                    ⬇️ {downloadingId === d.id ? t("designs.downloading") : t("designs.download")}
                  </button>
                )}
                <Link
                  href={`/create?prompt=${encodeURIComponent(d.prompt)}&channel=${encodeURIComponent(d.channel ?? "Facebook post")}`}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-thukha-violet/10 px-4 py-2 text-xs font-bold text-thukha-violet transition-all duration-200 hover:bg-thukha-violet hover:text-white sm:text-sm dark:bg-white/5 dark:text-thukha-lilac dark:hover:bg-thukha-lilac dark:hover:text-thukha-indigo"
                >
                  ⚡ {t("designs.recreate")}
                </Link>
                <button
                  type="button"
                  onClick={() => deleteDesign(d.id)}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition-all duration-200 hover:bg-rose-600 hover:text-white sm:text-sm dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 dark:hover:text-white"
                >
                  🗑️ {t("common.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {loggedIn && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-black text-thukha-indigo dark:text-white">{t("designs.historyTitle")}</h2>
          <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("designs.note")}</p>
          {generations.length === 0 ? (
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">{t("designs.historyEmpty")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {generations.map((g) => {
                const channelFor = g.format === "story" ? "Story" : g.format === "cover" ? "Cover" : "Facebook post";
                return (
                  <li key={g.id} className="flex flex-col gap-2 rounded-2xl border border-thukha-lilac/30 bg-white/75 p-4 dark:border-white/10 dark:bg-thukha-indigo/70">
                    <p className="text-sm leading-6">&ldquo;{g.prompt}&rdquo;</p>
                    <p className="text-xs text-thukha-indigo/60 dark:text-white/60">
                      {g.created_at ? new Date(g.created_at).toLocaleString(lang === "my" ? "my-MM" : "en-GB") : ""} • {g.format ?? ""} • {t("designs.historySpent")}: {g.cost_tokens}
                    </p>
                    <Link
                      href={`/create?prompt=${encodeURIComponent(g.prompt)}&channel=${encodeURIComponent(channelFor)}`}
                      className="inline-flex min-h-[40px] w-fit items-center justify-center rounded-xl bg-thukha-violet/10 px-4 py-2 text-xs font-bold text-thukha-violet dark:bg-white/5 dark:text-thukha-lilac"
                    >
                      ⚡ {t("designs.recreate")}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
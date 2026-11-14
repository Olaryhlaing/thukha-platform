"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import { getSupabase } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

type UserTemplate = {
  id: string;
  name: string;
  business_type: string | null;
  goal: string | null;
  channel: string | null;
  headline: string | null;
  subheadline: string | null;
  prompt: string | null;
  is_favorite: boolean;
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "စားသောက်ဆိုင်": { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  "Online shop": { bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-600 dark:text-teal-300", dot: "bg-teal-500" },
  "အလှအပ": { bg: "bg-pink-500/10 dark:bg-pink-500/20", text: "text-pink-600 dark:text-pink-300", dot: "bg-pink-500" },
  "ဝန်ဆောင်မှု": { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  "Agency": { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-300", dot: "bg-purple-500" },
  "အခြား": { bg: "bg-slate-500/10 dark:bg-slate-500/20", text: "text-slate-600 dark:text-slate-300", dot: "bg-slate-500" },
};

function readGuestTemplates(): UserTemplate[] {
  try {
    return JSON.parse(localStorage.getItem("thukha-user-templates") ?? "[]") as UserTemplate[];
  } catch {
    return [];
  }
}

export default function TemplatesPage() {
  const { t } = useLanguage();
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>(() => {
    if (typeof window === "undefined" || getSupabase()) return [];
    return readGuestTemplates();
  });
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [favFilter, setFavFilter] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token ?? null;
      setAuthToken(token);
      if (!token) {
        setUserTemplates(readGuestTemplates());
        return;
      }
      try {
        const res = await fetch("/api/user-templates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as { templates?: UserTemplate[] };
        if (res.ok && Array.isArray(json.templates)) setUserTemplates(json.templates);
      } catch {
        // Optional personal templates
      }
    });
  }, []);

  async function toggleFavorite(item: UserTemplate) {
    const nextFav = !item.is_favorite;
    if (authToken) {
      const res = await fetch("/api/user-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ id: item.id, is_favorite: nextFav }),
      });
      if (!res.ok) return;
    } else {
      const updated = userTemplates.map((u) => (u.id === item.id ? { ...u, is_favorite: nextFav } : u));
      localStorage.setItem("thukha-user-templates", JSON.stringify(updated));
    }
    setUserTemplates((prev) =>
      prev
        .map((u) => (u.id === item.id ? { ...u, is_favorite: nextFav } : u))
        .sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite)),
    );
  }

  async function deleteUserTemplate(id: string) {
    if (authToken) {
      const res = await fetch(`/api/user-templates?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return;
    } else {
      const next = userTemplates.filter((u) => u.id !== id);
      localStorage.setItem("thukha-user-templates", JSON.stringify(next));
    }
    setUserTemplates((prev) => prev.filter((u) => u.id !== id));
  }

  const displayedUserTemplates = favFilter
    ? userTemplates.filter((u) => u.is_favorite)
    : userTemplates;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12">
      {/* Personal Templates & Favourites */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-thukha-indigo dark:text-white">
              {t("templates.myTitle")}
            </h2>
            <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
              {t("templates.mySubtitle")}
            </p>
          </div>
          {userTemplates.length > 0 && (
            <button
              type="button"
              onClick={() => setFavFilter((v) => !v)}
              className={`min-h-[40px] rounded-full border px-4 py-1.5 text-xs font-bold transition-colors ${
                favFilter
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-thukha-lilac/40 bg-white/60 text-thukha-indigo dark:border-white/15 dark:bg-white/5 dark:text-white"
              }`}
            >
              ⭐ {t("templates.favoritesOnly")}
            </button>
          )}
        </div>

        {displayedUserTemplates.length === 0 ? (
          <div className="rounded-3xl border border-thukha-lilac/30 bg-white/65 p-6 text-sm text-thukha-indigo/75 backdrop-blur-md dark:border-white/10 dark:bg-thukha-indigo/60 dark:text-white/75">
            {favFilter ? t("templates.favoritesEmpty") : t("templates.myEmpty")}{" "}
            <Link href="/create" className="font-bold text-thukha-violet dark:text-thukha-lilac">
              {t("common.goToCreate")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedUserTemplates.map((ut) => {
              const style = CATEGORY_STYLES[ut.business_type ?? ""] ?? {
                bg: "bg-thukha-violet/10 dark:bg-white/10",
                text: "text-thukha-violet dark:text-thukha-lilac",
                dot: "bg-thukha-violet",
              };
              return (
                <article
                  key={ut.id}
                  className="gradient-border-top interactive-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-thukha-indigo/70"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${style.bg} ${style.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {ut.business_type || "Custom"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFavorite(ut)}
                        aria-label={t("templates.toggleFavorite")}
                        className={`rounded-full px-2.5 py-1 text-sm font-bold transition-transform hover:scale-110 ${
                          ut.is_favorite ? "text-amber-500" : "text-thukha-indigo/35 dark:text-white/35"
                        }`}
                      >
                        {ut.is_favorite ? "★" : "☆"}
                      </button>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-thukha-indigo dark:text-white">
                      {ut.name}
                    </h3>

                    {ut.headline && (
                      <div className="rounded-xl border border-thukha-lilac/20 bg-white/50 p-3 text-sm leading-relaxed text-thukha-indigo/80 dark:border-white/5 dark:bg-white/5 dark:text-white/80">
                        <span className="font-semibold text-thukha-violet dark:text-thukha-lilac">Headline:</span> &ldquo;{ut.headline}&rdquo;
                      </div>
                    )}

                    {ut.prompt && (
                      <p className="line-clamp-2 text-xs text-thukha-indigo/65 dark:text-white/65">
                        {ut.prompt}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center gap-2 border-t border-thukha-lilac/20 pt-4 dark:border-white/10">
                    <Link
                      href={`/create?user_template=${encodeURIComponent(ut.id)}`}
                      className="inline-flex flex-1 items-center justify-between rounded-xl bg-thukha-violet/10 px-4 py-2.5 text-xs font-bold text-thukha-violet transition-all duration-200 hover:bg-thukha-violet hover:text-white sm:text-sm dark:bg-white/5 dark:text-thukha-lilac dark:hover:bg-thukha-lilac dark:hover:text-thukha-indigo"
                    >
                      <span>{t("templates.useTemplate")}</span>
                      <span>→</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => deleteUserTemplate(ut.id)}
                      className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300"
                    >
                      🗑️
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Built-in Templates */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-thukha-violet/30 bg-thukha-violet/10 px-3.5 py-1 text-xs font-bold text-thukha-violet dark:border-thukha-lilac/40 dark:bg-white/10 dark:text-thukha-lilac">
              <span className="pulsing-dot h-2 w-2 rounded-full bg-thukha-teal" />
              AI Templates Gallery
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            <span className="colorful-text-gradient">Templates — လုပ်ငန်းအမျိုးအစားအလိုက်</span>
          </h1>
          <p className="max-w-2xl text-base leading-7 text-thukha-indigo/70 dark:text-white/70">
            လုပ်ငန်းနှင့်ကိုက်ညီသော template ရွေးချယ်ပြီး ဖန်တီးပါ — အမျိုးအစား၊ channel၊ prompt များကို တစ်ခါတည်း အသင့်ပြင်ဆင်ပေးထားပါသည်။
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl, idx) => {
            const style = CATEGORY_STYLES[tpl.type] ?? {
              bg: "bg-thukha-violet/10 dark:bg-white/10",
              text: "text-thukha-violet dark:text-thukha-lilac",
              dot: "bg-thukha-violet",
            };
            return (
              <article
                key={tpl.id}
                className={`gradient-border-top interactive-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-thukha-lilac/30 bg-white/70 p-6 shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-thukha-indigo/70 stagger-${(idx % 5) + 1}`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${style.bg} ${style.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {tpl.type}
                    </span>
                    <span className="rounded-lg border border-thukha-lilac/30 bg-white/40 px-2 py-0.5 text-xs font-medium text-thukha-indigo/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                      {tpl.format}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold tracking-tight transition-colors group-hover:text-thukha-violet dark:group-hover:text-thukha-lilac">
                    {tpl.name}
                  </h2>

                  <div className="rounded-xl border border-thukha-lilac/20 bg-white/50 p-3 text-sm leading-relaxed text-thukha-indigo/80 dark:border-white/5 dark:bg-white/5 dark:text-white/80">
                    <span className="font-semibold text-thukha-violet dark:text-thukha-lilac">Headline:</span> &ldquo;{tpl.headline}&rdquo;
                  </div>

                  <p className="text-xs text-thukha-indigo/60 dark:text-white/60">
                    {tpl.product} · {tpl.target}
                  </p>
                </div>

                <div className="mt-6 border-t border-thukha-lilac/20 pt-4 dark:border-white/10">
                  <Link
                    href={`/create?template=${tpl.id}`}
                    className="inline-flex w-full items-center justify-between rounded-xl bg-thukha-violet/10 px-4 py-2.5 text-sm font-bold text-thukha-violet transition-all duration-200 group-hover:bg-thukha-violet group-hover:text-white dark:bg-white/5 dark:text-thukha-lilac dark:group-hover:bg-thukha-lilac dark:group-hover:text-thukha-indigo"
                  >
                    <span>{t("templates.useTemplate")}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
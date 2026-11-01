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
  created_at?: string;
};

/* Designs are saved prompt records (image blobs are NOT stored —
   Storage is the next step). Logged-in: Supabase designs table.
   Guest: this browser's localStorage "thukha-designs". The re-create
   button prefills /create with the same prompt/channel. */
function readGuestDesigns(): Design[] {
  try {
    return JSON.parse(localStorage.getItem("thukha-designs") ?? "[]") as Design[];
  } catch {
    return [];
  }
}

export default function DesignsPage() {
  const { t } = useLanguage();
  const [designs, setDesigns] = useState<Design[]>(() => {
    if (typeof window === "undefined" || getSupabase()) return [];
    return readGuestDesigns();
  });
  const [loggedIn, setLoggedIn] = useState(false);

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
    });
  }, []);

  async function deleteDesign(id: string) {
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (token) {
      // Only remove locally when the server confirms the delete —
      // the old code removed it even on a 404/403, so a refresh
      // brought the design back (a confusing false delete).
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold">My Designs</h1>
      <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">
        {loggedIn
          ? t("designs.loggedIn")
          : t("designs.guest")}
        <br />
        {t("designs.note")}
      </p>
      {designs.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="leading-7 text-thukha-indigo/70 dark:text-white/70">
            {t("designs.empty")}
          </p>
          <Link href="/create" className="font-bold text-thukha-violet dark:text-thukha-lilac">{t("common.goToCreate")}</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {designs.map((d) => (
            <li key={d.id} className="flex flex-col gap-3 rounded-2xl border border-thukha-lilac/40 p-4">
              <p className="leading-7">{d.prompt}</p>
              <p className="text-sm text-thukha-indigo/70 dark:text-white/70">
                {d.channel ?? ""} • {d.format ?? ""}
                {d.created_at ? ` • ${new Date(d.created_at).toLocaleDateString()}` : ""}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/create?prompt=${encodeURIComponent(d.prompt)}&channel=${encodeURIComponent(d.channel ?? "Facebook post")}`}
                  className="min-h-[44px] flex items-center rounded-full border-2 border-thukha-violet px-4 py-1 text-sm font-bold text-thukha-violet dark:text-thukha-lilac"
                >
                  {t("designs.recreate")}
                </Link>
                <button type="button" onClick={() => deleteDesign(d.id)} className="min-h-[44px] rounded-full bg-amber-100 dark:bg-amber-900 px-4 py-1 text-sm font-bold text-amber-900 dark:text-amber-100">
                  {t("common.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

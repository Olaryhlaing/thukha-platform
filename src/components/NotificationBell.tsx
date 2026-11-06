"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

type Notif = {
  id: string;
  type: string;
  detail: string | null;
  link: string;
  is_read: boolean;
  created_at: string;
};

/* Header notification bell: unread badge + dropdown with the latest
   notifications. Logged-out visitors see nothing. Clicking an item
   marks it read and goes to its page. In-app only — no email and
   no phone push notification is sent. */
export default function NotificationBell() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  // Dropdown shows only the latest 4 at first; "Show more" reveals
  // 4 older ones at a time, "Show less" collapses back to 4.
  const [visibleCount, setVisibleCount] = useState(4);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const token = (await supabase.auth.getSession())?.data.session?.access_token;
    if (!token) {
      setLoggedIn(false);
      return;
    }
    setLoggedIn(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { notifications?: Notif[]; unread?: number };
      if (res.ok) {
        setItems(json.notifications ?? []);
        setUnread(json.unread ?? 0);
      }
    } catch {
      // Bell is extra — the header still works without it.
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const timer = setInterval(load, 60000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open ]);

  async function markRead(id?: string, all?: boolean) {
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (!token) return;
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(all ? { all: true } : { id }),
      });
    } catch {
      // Marking read is extra — the navigation still happens.
    }
    if (all) {
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnread(0);
    } else if (id) {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnread((prev) => Math.max(0, prev - 1));
    }
  }

  function titleOf(n: Notif) {
    return t(`notif.${n.type}Title`);
  }

  function bodyOf(n: Notif) {
    return t(`notif.${n.type}Body`, { detail: n.detail ?? "" });
  }

  if (!loggedIn) return null;

  return (
    <div ref={boxRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) {
            setVisibleCount(4);
            load();
          }
        }}
        aria-label={t("notif.title")}
        aria-expanded={open}
        className="relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border border-thukha-lilac/50 bg-white/50 text-xl text-thukha-violet transition-all duration-200 hover:border-thukha-violet hover:bg-thukha-violet/10 hover:scale-105 active:scale-95 dark:bg-white/5 dark:text-thukha-lilac dark:hover:bg-white/10"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white shadow">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[320px] max-w-[90vw] rounded-2xl border border-thukha-lilac/30 bg-white p-3 shadow-xl dark:border-white/10 dark:bg-thukha-indigo">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-sm font-black text-thukha-indigo dark:text-white">{t("notif.title")}</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markRead(undefined, true)}
                className="text-xs font-bold text-thukha-violet dark:text-thukha-lilac"
              >
                {t("notif.markAllRead")}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="px-1 py-3 text-sm text-thukha-indigo/70 dark:text-white/70">{t("notif.empty")}</p>
          ) : (
            <ul className="flex max-h-[60vh] flex-col gap-1 overflow-y-auto">
              {items.slice(0, visibleCount).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                      router.push(n.link);
                    }}
                    className={`w-full rounded-xl p-3 text-left transition-colors hover:bg-thukha-violet/10 dark:hover:bg-white/10 ${n.is_read ? "opacity-60" : "bg-thukha-violet/5 dark:bg-white/5"}`}
                  >
                    <p className="text-sm font-bold text-thukha-indigo dark:text-white">{titleOf(n)}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-thukha-indigo/70 dark:text-white/70">{bodyOf(n)}</p>
                    <p className="mt-1 text-[11px] text-thukha-indigo/50 dark:text-white/50">
                      {new Date(n.created_at).toLocaleString(lang === "my" ? "my-MM" : "en-GB")}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {items.length > 4 && (
            <button
              type="button"
              onClick={() => setVisibleCount((v) => (v >= items.length ? 4 : v + 4))}
              className="mt-2 w-full rounded-xl bg-thukha-violet/10 px-3 py-2 text-xs font-bold text-thukha-violet transition-colors hover:bg-thukha-violet/20 dark:bg-white/10 dark:text-thukha-lilac dark:hover:bg-white/15"
            >
              {visibleCount >= items.length
                ? t("notif.showLess")
                : t("notif.showMore", { count: String(Math.min(4, items.length - visibleCount)) })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

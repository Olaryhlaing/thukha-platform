"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

/* Light / dark toggle. The choice is saved in localStorage
   ("thukha-theme") and applied as a `dark` class on <html>, so it
   survives reloads. First visit with no saved choice follows the
   device's prefers-color-scheme setting (and the no-flash script
   in layout.tsx applies it before first paint). */
export default function ThemeToggle() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("thukha-theme");
    const dark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    // One-time initial sync from localStorage/device into the
    // button label, not a render loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(dark ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("thukha-theme", next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? t("theme.toLight") : t("theme.toDark")}
      className="flex min-h-[44px] items-center rounded-full border border-thukha-lilac/50 px-4 py-2 text-sm font-bold text-thukha-violet dark:text-thukha-lilac"
    >
      {theme === "dark" ? t("theme.light") : t("theme.dark")}
    </button>
  );
}

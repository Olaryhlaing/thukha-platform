"use client";

import { useLanguage } from "@/components/LanguageProvider";

/* Burmese / English toggle, next to the theme toggle in the
   header (always visible, even on auth pages). Shows the language
   you would switch TO: "English" while in Burmese, "မြန်မာ" while
   in English. */
export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "my" ? "en" : "my")}
      aria-label={lang === "my" ? "Switch to English" : "မြန်မာဘာသာသို့ ပြောင်းပါ"}
      className="flex min-h-[40px] shrink-0 items-center whitespace-nowrap rounded-full border border-thukha-lilac/40 bg-white/50 px-3 py-1.5 text-xs font-bold text-thukha-violet backdrop-blur-sm transition-all duration-200 hover:border-thukha-violet hover:bg-thukha-violet/10 hover:shadow-[0_0_12px_rgba(89,70,237,0.25)] hover:scale-105 active:scale-95 sm:px-4 sm:text-sm dark:border-white/15 dark:bg-white/5 dark:text-thukha-lilac dark:hover:border-thukha-lilac dark:hover:bg-white/10"
    >
      {lang === "my" ? "English" : "မြန်မာ"}
    </button>
  );
}

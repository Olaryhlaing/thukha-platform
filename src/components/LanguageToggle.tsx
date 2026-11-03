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
      className="flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-full border border-thukha-lilac/50 px-3 py-2 text-xs font-bold text-thukha-violet sm:px-4 sm:text-sm dark:text-thukha-lilac"
    >
      {lang === "my" ? "English" : "မြန်မာ"}
    </button>
  );
}

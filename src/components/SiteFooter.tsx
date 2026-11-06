"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

/* Fixed footer (glassmorphic, gradient accent border). The Privacy
   link text follows the selected language, like the rest of the UI. */
export default function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-thukha-lilac/30 bg-white/90 py-4.5 text-center text-sm text-thukha-indigo/70 backdrop-blur-md dark:border-white/10 dark:bg-thukha-indigo/90 dark:text-white/70">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-thukha-violet via-pink-500 via-thukha-teal to-thukha-lilac bg-[length:200%_auto] animate-[thu-gradient-flow_6s_ease_infinite]" />
      <div className="mx-auto flex flex-wrap items-center justify-center gap-2 px-4 sm:gap-3">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="pulsing-dot h-2 w-2 rounded-full bg-emerald-400" />
          <span>ThuKha Platform</span>
        </span>
        <span className="text-thukha-lilac/60">·</span>
        <Link
          href="/privacy"
          className="font-semibold text-thukha-violet transition-all duration-200 hover:text-thukha-blue hover:underline dark:text-thukha-lilac dark:hover:text-thukha-teal"
        >
          {t("privacy.title")}
        </Link>
      </div>
    </footer>
  );
}

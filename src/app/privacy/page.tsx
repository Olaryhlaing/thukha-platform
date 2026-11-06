"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function PrivacyPage() {
  const { t } = useLanguage();
  const sections: [string, string][] = [
    [t("privacy.collectTitle"), t("privacy.collectBody")],
    [t("privacy.useTitle"), t("privacy.useBody")],
    [t("privacy.seeTitle"), t("privacy.seeBody")],
    [t("privacy.guestTitle"), t("privacy.guestBody")],
    [t("privacy.keepTitle"), t("privacy.keepBody")],
    [t("privacy.rightsTitle"), t("privacy.rightsBody")],
    [t("privacy.localTitle"), t("privacy.localBody")],
    [t("privacy.changeTitle"), t("privacy.changeBody")],
  ];
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-thukha-violet/30 bg-thukha-violet/10 px-3.5 py-1 text-xs font-bold text-thukha-violet dark:border-thukha-lilac/40 dark:bg-white/10 dark:text-thukha-lilac">
            <span className="pulsing-dot h-2 w-2 rounded-full bg-emerald-400" />
            {t("privacy.badge")}
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          <span className="colorful-text-gradient">{t("privacy.title")}</span>
        </h1>
        <p className="text-sm font-medium text-thukha-indigo/60 dark:text-white/60">
          {t("privacy.updated")}
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-thukha-lilac/30 bg-white/75 p-6 shadow-xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-thukha-indigo/70">
        <p className="rounded-2xl border border-thukha-violet/20 bg-thukha-violet/5 p-4 text-base leading-relaxed text-thukha-indigo/90 dark:bg-white/5 dark:text-white/90">
          {t("privacy.intro")}
        </p>

        <div className="mt-8 space-y-6">
          {sections.map(([title, body], idx) => (
            <section
              key={title}
              className={`rounded-2xl border border-thukha-lilac/25 bg-white/50 p-5 transition-all duration-200 hover:border-thukha-violet/30 hover:bg-white/80 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10 stagger-${(idx % 5) + 1}`}
            >
              <h2 className="text-lg font-bold text-thukha-indigo dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-thukha-indigo/80 dark:text-white/80">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

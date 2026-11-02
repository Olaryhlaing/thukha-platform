"use client";

import { useLanguage } from "@/components/LanguageProvider";

/* Privacy policy, plain language, in the user's chosen language.
   Every claim here is checked against the code: signup fields,
   the generations log, the provider strip in lib/privacy.ts,
   Cloudflare rejecting references, the account-delete API, and
   the service worker never caching /api/. If a feature changes,
   this page must change with it — do not let it drift into a
   promise the code does not keep. */
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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-bold">{t("privacy.title")}</h1>
      <p className="mt-2 text-sm text-thukha-indigo/60 dark:text-white/60">
        {t("privacy.updated")}
      </p>
      <p className="mt-4 leading-7">{t("privacy.intro")}</p>
      {sections.map(([title, body]) => (
        <section key={title} className="mt-8">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-2 leading-7">{body}</p>
        </section>
      ))}
    </main>
  );
}

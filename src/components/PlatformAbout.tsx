import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function PlatformAbout() {
  const { t } = useLanguage();
  return (
    <section className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-thukha-lilac/30 bg-thukha-indigo p-6 text-white shadow-2xl backdrop-blur-xl sm:p-8">
      {/* Ambient background glow inside the card */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-thukha-violet/40 to-thukha-teal/20 blur-3xl animate-thu-aurora-spin"
        style={{ animationDuration: "20s" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-pink-500/20 to-thukha-blue/30 blur-3xl animate-thu-float"
        style={{ animationDuration: "12s" }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="pulsing-dot h-2.5 w-2.5 rounded-full bg-thukha-teal" />
          <h2 className="text-2xl font-black tracking-tight text-white">ThuKha Platform</h2>
        </div>
        <p className="text-base leading-7 text-white/90">
          {t("about.tagline")}
        </p>

        <ol className="my-2 flex flex-col gap-3 text-sm leading-6">
          <li className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 backdrop-blur-sm transition-transform hover:translate-x-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-thukha-violet to-thukha-lilac text-xs font-black text-white">1</span>
            <strong className="text-white/90">{t("about.step1")}</strong>
          </li>
          <li className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 backdrop-blur-sm transition-transform hover:translate-x-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-thukha-violet to-thukha-teal text-xs font-black text-white">2</span>
            <strong className="text-white/90">{t("about.step2")}</strong>
          </li>
          <li className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5 backdrop-blur-sm transition-transform hover:translate-x-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-thukha-teal to-thukha-blue text-xs font-black text-white">3</span>
            <strong className="text-white/90">{t("about.step3")}</strong>
          </li>
        </ol>

        <p className="rounded-2xl border border-thukha-teal/30 bg-thukha-teal/10 p-4 text-sm leading-6 text-white/95 backdrop-blur-sm">
          {t("about.burmesePromise")}
        </p>

        <p className="text-sm font-medium leading-6 text-white/80">
          {t("about.tokens")}
        </p>
      </div>

      <div className="relative z-10 mt-6 border-t border-white/10 pt-4">
        <Link
          href="/create"
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-thukha-lilac transition-all hover:text-thukha-teal"
        >
          <span>{t("about.guest")}</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
}

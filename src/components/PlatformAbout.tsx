import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

/* Shared ThuKha summary shown on Login and Signup (the X-Panda
   style: the auth page itself explains the platform, so a new
   visitor does not have to go back to Home to understand it).
   Kept in one component so Login and Signup can never drift apart.
   Only settled facts: no pricing, no payments, no launch claims. */
export default function PlatformAbout() {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-thukha-indigo p-6 text-white">
      <h2 className="text-2xl font-bold">ThuKha Platform</h2>
      <p className="text-base leading-7 text-white/90">
        {t("about.tagline")}
      </p>
      <ol className="flex flex-col gap-2 text-sm leading-6 text-white/90">
        <li><strong className="text-white">{t("about.step1")}</strong></li>
        <li><strong className="text-white">{t("about.step2")}</strong></li>
        <li><strong className="text-white">{t("about.step3")}</strong></li>
      </ol>
      <p className="rounded-xl bg-white/10 p-4 text-sm leading-6 text-white/90">
        {t("about.burmesePromise")}
      </p>
      <p className="text-sm leading-6 text-white/80">
        {t("about.tokens")}
      </p>
      <Link href="/create" className="text-sm font-bold text-thukha-lilac">
        {t("about.guest")}
      </Link>
    </section>
  );
}

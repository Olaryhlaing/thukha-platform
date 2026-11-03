import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

// Category color palettes for visual variety
const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "စားသောက်ဆိုင်": { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  "Online shop": { bg: "bg-teal-500/10 dark:bg-teal-500/20", text: "text-teal-600 dark:text-teal-300", dot: "bg-teal-500" },
  "အလှအပ": { bg: "bg-pink-500/10 dark:bg-pink-500/20", text: "text-pink-600 dark:text-pink-300", dot: "bg-pink-500" },
  "ဝန်ဆောင်မှု": { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  "Agency": { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-300", dot: "bg-purple-500" },
  "အခြား": { bg: "bg-slate-500/10 dark:bg-slate-500/20", text: "text-slate-600 dark:text-slate-300", dot: "bg-slate-500" },
};

export default function TemplatesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-thukha-violet/30 bg-thukha-violet/10 px-3.5 py-1 text-xs font-bold text-thukha-violet dark:border-thukha-lilac/40 dark:bg-white/10 dark:text-thukha-lilac">
            <span className="pulsing-dot h-2 w-2 rounded-full bg-thukha-teal" />
            AI Templates Gallery
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          <span className="colorful-text-gradient">Templates — လုပ်ငန်းအမျိုးအစားအလိုက်</span>
        </h1>
        <p className="max-w-2xl text-base leading-7 text-thukha-indigo/70 dark:text-white/70">
          လုပ်ငန်းနှင့်ကိုက်ညီသော template ရွေးချယ်ပြီး ဖန်တီးပါ — အမျိုးအစား၊ channel၊ prompt များကို တစ်ခါတည်း အသင့်ပြင်ဆင်ပေးထားပါသည်။
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t, idx) => {
          const style = CATEGORY_STYLES[t.type] ?? {
            bg: "bg-thukha-violet/10 dark:bg-white/10",
            text: "text-thukha-violet dark:text-thukha-lilac",
            dot: "bg-thukha-violet",
          };
          return (
            <article
              key={t.id}
              className={`gradient-border-top interactive-card group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-thukha-lilac/30 bg-white/70 p-6 shadow-md backdrop-blur-md transition-all duration-300 hover:shadow-xl dark:border-white/10 dark:bg-thukha-indigo/70 stagger-${(idx % 5) + 1}`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${style.bg} ${style.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {t.type}
                  </span>
                  <span className="rounded-lg border border-thukha-lilac/30 bg-white/40 px-2 py-0.5 text-xs font-medium text-thukha-indigo/60 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                    {t.format}
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight transition-colors group-hover:text-thukha-violet dark:group-hover:text-thukha-lilac">
                  {t.name}
                </h2>

                <div className="rounded-xl border border-thukha-lilac/20 bg-white/50 p-3 text-sm leading-relaxed text-thukha-indigo/80 dark:border-white/5 dark:bg-white/5 dark:text-white/80">
                  <span className="font-semibold text-thukha-violet dark:text-thukha-lilac">Headline:</span> &ldquo;{t.headline}&rdquo;
                </div>

                <p className="text-xs text-thukha-indigo/60 dark:text-white/60">
                  {t.product} · {t.target}
                </p>
              </div>

              <div className="mt-6 border-t border-thukha-lilac/20 pt-4 dark:border-white/10">
                <Link
                  href={`/create?template=${t.id}`}
                  className="inline-flex w-full items-center justify-between rounded-xl bg-thukha-violet/10 px-4 py-2.5 text-sm font-bold text-thukha-violet transition-all duration-200 group-hover:bg-thukha-violet group-hover:text-white dark:bg-white/5 dark:text-thukha-lilac dark:group-hover:bg-thukha-lilac dark:group-hover:text-thukha-indigo"
                >
                  <span>ဒီ template နဲ့ ဖန်တီးပါ</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

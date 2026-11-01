import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";

export default function TemplatesPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold">Templates — လုပ်ငန်းအမျိုးအစားအလိုက်</h1>
      <p className="leading-7 text-thukha-indigo/70">
        Template ရွေး → /create မှာ အမျိုးအစား၊ channel၊ prompt အကြမ်း အလိုလို ဖြည့်ပေးမယ်။
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <article
            key={t.id}
            className="flex flex-col gap-2 rounded-2xl border border-thukha-lilac/40 bg-thukha-lilac/10 p-5"
          >
            <p className="text-sm font-bold text-thukha-violet">{t.type}</p>
            <h2 className="font-bold">{t.name}</h2>
            <p className="leading-7">Headline: {t.headline}</p>
            <p className="text-sm text-thukha-indigo/70">
              {t.product} • {t.target} • {t.format}
            </p>
            <Link href={`/create?template=${t.id}`} className="mt-2 font-bold text-thukha-violet">
              ဒီ template နဲ့ ဖန်တီးပါ →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    n: "၁",
    title: "လုပ်ငန်း ရွေးပါ",
    body: "အမျိုးအစား၊ အမည်၊ goal၊ channel ရွေးပါ။",
  },
  {
    n: "၂",
    title: "AI ပုံ ဖန်တီးပါ",
    body: "လိုချင်တဲ့ ပုံအကြောင်း ရေးပါ။",
  },
  {
    n: "၃",
    title: "Download လုပ်ပါ",
    body: "AI ပုံကို PNG အဖြစ် download လုပ်ပါ။",
  },
];

const aiFeatures = [
  "AI ပုံ: prompt ရေး → ပုံထုတ်",
  "ပုံထဲမှာ စာမပါဘူး",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-10">
      <section className="grid gap-8 rounded-3xl bg-gradient-to-br from-thukha-violet via-thukha-violet to-thukha-lilac p-6 text-white shadow-xl shadow-thukha-violet/30 sm:p-10 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ်
          </h1>
          <p className="max-w-xl text-lg leading-8 text-white/85">
            ၁ မိနစ်အတွင်း၊ မြန်မာစာ ၁၀၀% မှန်တဲ့ promo post။
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create"
              className="rounded-full bg-white px-6 py-3 font-bold text-thukha-violet hover:bg-thukha-lilac hover:text-white"
            >
              စတင်ဖန်တီးပါ
            </Link>
            <Link
              href="/templates"
              className="rounded-full border border-white/40 px-6 py-3 font-bold text-white hover:bg-white/10"
            >
              Templates ကြည့်ပါ
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Image
            src="/thukha-splash.png"
            alt="ThuKha Platform splash"
            width={480}
            height={480}
            className="w-full max-w-[420px] rounded-3xl bg-white/10 object-cover"
            priority
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">ဘယ်လို အလုပ်လုပ်လဲ — ၃ ဆင့်</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s) => (
            <article
              key={s.n}
              className="rounded-2xl border border-thukha-lilac/40 bg-thukha-lilac/10 p-5"
            >
              <p className="flex h-10 w-10 items-center justify-center rounded-full bg-thukha-violet font-bold text-white">
                {s.n}
              </p>
              <h3 className="mt-3 font-bold">{s.title}</h3>
              <p className="mt-1 leading-7 text-thukha-indigo/70">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 rounded-2xl border border-thukha-lilac/40 p-6">
          <h2 className="text-xl font-bold">AI မှာ ဘာတွေပါလဲ</h2>
          <ul className="flex flex-col gap-2">
            {aiFeatures.map((f) => (
              <li key={f} className="leading-7 text-thukha-indigo/75">
                • {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

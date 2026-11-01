import Link from "next/link";

/* Shared ThuKha summary shown on Login and Signup (the X-Panda
   style: the auth page itself explains the platform, so a new
   visitor does not have to go back to Home to understand it).
   Kept in one component so Login and Signup can never drift apart.
   Only settled facts: no pricing, no payments, no launch claims. */
export default function PlatformAbout() {
  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-thukha-indigo p-6 text-white">
      <h2 className="text-2xl font-bold">ThuKha Platform</h2>
      <p className="text-base leading-7 text-white/90">
        သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ် — Myanmar လုပ်ငန်းတွေအတွက်
        AI promo ပုံ ထုတ်တဲ့ platform ပါ။
      </p>
      <ol className="flex flex-col gap-3 text-sm leading-6 text-white/90">
        <li>
          <strong className="text-white">၁။ လုပ်ငန်း + စာ ရိုက်ပါ</strong>
          <br />
          လုပ်ငန်းအမျိုးအစား၊ အမည်၊ ရည်ရွယ်ချက်နဲ့ ပုံပေါ်မှာ ပေါ်မယ့် စာ။
        </li>
        <li>
          <strong className="text-white">၂။ AI ပုံ ဖန်တီးပါ</strong>
          <br />
          Facebook post, Story, Cover, Menu card အတွက် ပုံတစ်ပုံ ရမယ်။
        </li>
        <li>
          <strong className="text-white">၃။ စာနဲ့ PNG download လုပ်ပါ</strong>
          <br />
          ပုံကို Facebook မှာ တိုက်ရိုက် တင်လို့ရတယ်။
        </li>
      </ol>
      <p className="rounded-xl bg-white/10 p-4 text-sm leading-6 text-white/90">
        မြန်မာစာကို AI ပုံထဲမှာ မရေးဘူး — ပုံထုတ်ပြီးမှ browser မှာ
        ကိုယ်တိုင် ထပ်ရေးပေးလို့ စာလုံး မပျက်ဘူး၊ မမှားဘူး။
      </p>
      <p className="text-sm leading-6 text-white/80">
        Signup ပြီးရင် token 100 အလကား ရတယ်။ ပုံတစ်ပုံ 10–35 token ကုန်တယ်။
        Login ထားရင် token က account နဲ့ ချိတ်ထားတယ်။
      </p>
      <Link href="/create" className="text-sm font-bold text-thukha-lilac">
        Account မရှိလည်း /create မှာ guest အနေနဲ့ စမ်းကြည့်လို့ရတယ် →
      </Link>
    </section>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white px-3 py-3 text-base text-thukha-indigo outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Signup</h1>
        <p className="leading-7 text-thukha-indigo/70">
          Supabase မချိတ်သေးပါ — .env.local (ဒါမှမဟုတ် Vercel Env) မှာ
          NEXT_PUBLIC_SUPABASE_URL နဲ့ NEXT_PUBLIC_SUPABASE_ANON_KEY ထည့်ပြီးမှ
          signup လုပ်လို့ရမယ်။
        </p>
        <Link href="/create" className="font-bold text-thukha-violet">/create ကို သွားပါ →</Link>
      </main>
    );
  }

  async function signup() {
    if (!email.trim() || password.length < 6) {
      setError("Email ရေးပြီး password အနည်းဆုံး ၆ လုံး ရေးပေးပါ။");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    const supabase = getSupabase();
    const { data, error: err } = await supabase!.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (err) {
      setError("Signup မအောင်ပါ။ Email စစ်ပြီး ထပ်ကြိုးစားပါ။");
      return;
    }
    if (!data.session) {
      // Supabase Auth "Confirm email" is ON: the user must confirm
      // by email before a session exists. Token balance is created
      // on first login (see /api/tokens).
      setMessage("Signup အောင်ပြီ။ Email ထဲက confirm link ကို နှိပ်ပြီးမှ login လုပ်ပါ။ (Supabase Auth မှာ Confirm email OFF လုပ်ထားရင် ဒီအဆင့် မလိုဘူး။)");
      return;
    }
    router.push("/create");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Signup</h1>
      <p className="text-sm leading-6 text-thukha-indigo/70">
        Signup ပြီးရင် token 100 နဲ့ စမယ်။ Token က account နဲ့ ချိတ်ထားတယ်။
      </p>
      <label className="text-sm font-bold text-thukha-indigo">
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm font-bold text-thukha-indigo">
        Password (အနည်းဆုံး ၆ လုံး)
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={`${inputClass} mt-1`} />
      </label>
      {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-300">{error}</p>}
      {message && <p className="rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900 ring-1 ring-teal-300">{message}</p>}
      <button type="button" onClick={signup} disabled={loading} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
        {loading ? "Signup လုပ်နေပါတယ်…" : "Signup"}
      </button>
      <p className="text-sm text-thukha-indigo/70">
        Account ရှိပြီးရင် <Link href="/login" className="font-bold text-thukha-violet">Login လုပ်ပါ</Link>
      </p>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white px-3 py-3 text-base text-thukha-indigo outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

/* Forgot password: type the account email, get a reset link.
   The link goes to /auth/reset-password (set explicitly here,
   never relying on Supabase's default Site URL). The success
   message is deliberately generic — it never says whether the
   email has an account, so nobody can probe for registered emails. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Password မေ့သွားလား?</h1>
        <p className="leading-7 text-thukha-indigo/70">
          Supabase မချိတ်သေးပါ — .env.local (ဒါမှမဟုတ် Vercel Env) မှာ
          NEXT_PUBLIC_SUPABASE_URL နဲ့ NEXT_PUBLIC_SUPABASE_ANON_KEY ထည့်ပြီးမှ
          reset email ပို့လို့ရမယ်။
        </p>
        <Link href="/login" className="font-bold text-thukha-violet">Login ကို သွားပါ →</Link>
      </main>
    );
  }

  async function sendReset() {
    if (!email.trim()) {
      setError("Email ရေးပေးပါ။");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    const { error: err } = await supabase!.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("too many") || msg.includes("rate")) {
        setError("ပို့တာ များသွားပြီ။ ခဏစောင့်ပြီး ထပ်ကြိုးစားပါ။");
      } else {
        setError("Reset email ပို့လို့ မရပါ။ Email စစ်ပြီး ထပ်ကြိုးစားပါ။");
      }
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Password မေ့သွားလား?</h1>
      {sent ? (
        <>
          <p className="rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900 ring-1 ring-teal-300">
            Reset link ပို့ပြီးပြီ။ အဲဒီ email မှာ account ရှိရင် inbox ထဲမှာ
            link ရောက်မယ် — Spam/Junk ထဲလည်း စစ်ကြည့်ပါ။ Link ကို နှိပ်ပြီး
            password အသစ် သတ်မှတ်ပါ။
          </p>
          <p className="text-sm text-thukha-indigo/70">
            Email မရောက်သေးရင် <button type="button" onClick={() => setSent(false)} className="font-bold text-thukha-violet">ထပ်ပို့ပါ</button>
            {" · "}
            <Link href="/login" className="font-bold text-thukha-violet">Login ကို သွားပါ</Link>
          </p>
        </>
      ) : (
        <>
          <p className="text-sm leading-6 text-thukha-indigo/70">
            Account ရဲ့ email ကို ရိုက်ပါ — password အသစ် သတ်မှတ်ဖို့ link ပို့ပေးမယ်။
          </p>
          <label className="text-sm font-bold text-thukha-indigo">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={`${inputClass} mt-1`} />
          </label>
          {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-300">{error}</p>}
          <button type="button" onClick={sendReset} disabled={loading} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
            {loading ? "ပို့နေပါတယ်…" : "Reset link ပို့ပါ"}
          </button>
          <p className="text-sm text-thukha-indigo/70">
            Password မှတ်မိသွားရင် <Link href="/login" className="font-bold text-thukha-violet">Login လုပ်ပါ</Link>
          </p>
        </>
      )}
    </main>
  );
}

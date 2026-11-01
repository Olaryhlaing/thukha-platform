"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import PlatformAbout from "@/components/PlatformAbout";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white px-3 py-3 text-base text-thukha-indigo outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

/* Signup, X-Panda-style careful, but adapted for ThuKha (a public
   SaaS, not a private team): X-Panda needs a full name, a password
   of at least 8, and a clear pending state instead of a silent
   auto-login. ThuKha does NOT copy X-Panda's invitation code or
   admin-approval gate — any customer may sign up directly.
   Email confirmation is explicit, not left to Supabase's default
   Site URL: signUp sets emailRedirectTo to /auth/confirm, and
   that page exchanges the link (code or hash token) for a session
   and sends the customer to /create. If Confirm email is OFF in
   Supabase, signUp returns a session at once and goes to /create. */
export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-10 md:grid-cols-2">
        <PlatformAbout />
        <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Signup</h1>
        <p className="leading-7 text-thukha-indigo/70">
          Supabase မချိတ်သေးပါ — .env.local (ဒါမှမဟုတ် Vercel Env) မှာ
          NEXT_PUBLIC_SUPABASE_URL နဲ့ NEXT_PUBLIC_SUPABASE_ANON_KEY ထည့်ပြီးမှ
          signup လုပ်လို့ရမယ်။
        </p>
        <Link href="/create" className="font-bold text-thukha-violet">/create ကို သွားပါ →</Link>
        </div>
      </main>
    );
  }

  async function signup() {
    if (!name.trim()) {
      setError("အမည် ရေးပေးပါ။");
      return;
    }
    if (!email.trim()) {
      setError("Email ရေးပေးပါ။");
      return;
    }
    if (password.length < 8) {
      setError("Password အနည်းဆုံး ၈ လုံး ရေးပေးပါ။");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password ၂ ခု မတူဘူး။ သေချာ စစ်ပြီး ထပ်ရေးပေးပါ။");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    const supabase = getSupabase();
    const { data, error: err } = await supabase!.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: name.trim() },
        // Explicit confirmation destination — never rely on the
        // Supabase default, which may point at localhost / a wrong
        // domain. /auth/confirm handles code + hash links.
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    setLoading(false);
    if (err) {
      const msg = (err.message ?? "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        setError("ဒီ email နဲ့ account ရှိနေပြီ။ Signup ထပ်လုပ်စရာ မလိုဘူး — Login လုပ်ပါ။");
      } else if (msg.includes("password")) {
        setError("Password အားနည်းနေတယ်။ အနည်းဆုံး ၈ လုံး၊ စာလုံး + ဂဏန်း ပါအောင် ရေးပေးပါ။");
      } else if (msg.includes("sign up") || msg.includes("signup") || msg.includes("not allowed")) {
        setError("Supabase မှာ signup ပိတ်ထားတယ်။ Authentication → Sign In / Providers မှာ Email နဲ့ Allow new users to sign up ကို စစ်ပါ။");
      } else if (msg.includes("email")) {
        setError("Email ပုံစံ မမှန်ပါ။ email အတိအကျ ရေးပြီး ထပ်ကြိုးစားပါ။");
      } else {
        setError("Signup မအောင်ပါ။ Email စစ်ပြီး ထပ်ကြိုးစားပါ။");
      }
      return;
    }
    if (!data.session) {
      // Supabase Auth "Confirm email" is ON: no session yet, the
      // customer must click the emailed link first. Show the
      // pending card (X-Panda style) instead of a one-line note.
      setPending(true);
      return;
    }
    router.push("/create");
  }

  async function resend() {
    const supabase = getSupabase();
    if (!supabase) return;
    setResending(true);
    setError("");
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    setResending(false);
    if (err) {
      setError("Confirm email ပြန်ပို့လို့ မရပါ။ ခဏစောင့်ပြီး ထပ်ကြိုးစားပါ။");
    } else {
      setMessage("Confirm email ကို ပြန်ပို့ပြီးပြီ။ Inbox (နဲ့ Spam / Junk) ကို စစ်ပါ။");
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-10 md:grid-cols-2">
      <PlatformAbout />
      <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Signup</h1>
      <p className="text-sm leading-6 text-thukha-indigo/70">
        Signup ပြီးရင် token 100 နဲ့ စမယ်။ Token က account နဲ့ ချိတ်ထားတယ်။
      </p>
      {pending ? (
        <div className="flex flex-col gap-4 rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-300">
          <h2 className="text-lg font-bold text-amber-900">Signup အောင်ပြီ — Email ကို အတည်ပြုပါ</h2>
          <p className="text-sm leading-6 text-amber-900">
            <b>{email}</b> ကို confirm email ပို့ပြီးပြီ။ Login မလုပ်ခင် အဲဒီ
            email ထဲက link ကို နှိပ်ရမယ်။
          </p>
          <ol className="flex flex-col gap-2 text-sm leading-6 text-amber-900">
            <li>၁။ Inbox ကို ဖွင့်ပါ — email မတွေ့ရင် <b>Spam / Junk</b> ကို စစ်ပါ။</li>
            <li>၂။ Email ထဲက <b>Confirm</b> link ကို နှိပ်ပါ — /auth/confirm ကို ရောက်ပြီး /create ကို အလိုလို သွားမယ်။</li>
            <li>၃။ Link သက်တမ်း ကုန်သွားရင် (expired) အောက်က ခလုတ်နဲ့ ပြန်ပို့ပါ။</li>
          </ol>
          {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-300">{error}</p>}
          {message && <p className="rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900 ring-1 ring-teal-300">{message}</p>}
          <button type="button" onClick={resend} disabled={resending} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
            {resending ? "ပို့နေပါတယ်…" : "Confirm email ပြန်ပို့ပါ"}
          </button>
          <p className="text-sm text-thukha-indigo/70">
            Confirm ပြီးရင် <Link href="/login" className="font-bold text-thukha-violet">Login လုပ်ပါ</Link>
          </p>
        </div>
      ) : (
        <>
          <label className="text-sm font-bold text-thukha-indigo">
            အမည်
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-bold text-thukha-indigo">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-bold text-thukha-indigo">
            Password (အနည်းဆုံး ၈ လုံး)
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-bold text-thukha-indigo">
            Password ထပ်ရေးပါ
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className={`${inputClass} mt-1`} />
          </label>
          {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-300">{error}</p>}
          {message && <p className="rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900 ring-1 ring-teal-300">{message}</p>}
          <button type="button" onClick={signup} disabled={loading} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
            {loading ? "Signup လုပ်နေပါတယ်…" : "Signup"}
          </button>
          <p className="text-sm text-thukha-indigo/70">
            Account ရှိပြီးရင် <Link href="/login" className="font-bold text-thukha-violet">Login လုပ်ပါ</Link>
          </p>
        </>
      )}
      </div>
    </main>
  );
}

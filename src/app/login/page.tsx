"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";
import PlatformAbout from "@/components/PlatformAbout";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white px-3 py-3 text-base text-thukha-indigo outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-10 md:grid-cols-2">
        <PlatformAbout />
        <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="leading-7 text-thukha-indigo/70">
          Supabase မချိတ်သေးပါ — .env.local (ဒါမှမဟုတ် Vercel Env) မှာ
          NEXT_PUBLIC_SUPABASE_URL နဲ့ NEXT_PUBLIC_SUPABASE_ANON_KEY ထည့်ပြီးမှ
          login လုပ်လို့ရမယ်။ အခု guest အနေနဲ့ /create မှာ ဆက်သုံးလို့ရတယ်။
        </p>
        <Link href="/create" className="font-bold text-thukha-violet">/create ကို သွားပါ →</Link>
        </div>
      </main>
    );
  }

  async function login() {
    if (!email.trim() || !password) {
      setError("Email နဲ့ password ရေးပေးပါ။");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    const { data, error: err } = await supabase!.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err || !data.session) {
      setLoading(false);
      const msg = (err?.message ?? "").toLowerCase();
      if (msg.includes("not confirmed") || msg.includes("confirm")) {
        setError("Email confirm လုပ်ပြီးမှ login ရမယ်။ inbox ထဲက confirm link ကို နှိပ်ပါ။");
      } else if (msg.includes("too many") || msg.includes("rate")) {
        setError("ကြိုးစားတာ များသွားပြီ။ ခဏစောင့်ပြီး ထပ်ကြိုးစားပါ။");
      } else if (msg.includes("invalid")) {
        setError("Email / password မှားနေတယ်။ သေချာ စစ်ပြီး ထပ်ကြိုးစားပါ။");
      } else {
        setError("Login မအောင်ပါ။ Email / password စစ်ပြီး ထပ်ကြိုးစားပါ။");
      }
      return;
    }
    // Unified login: one login page for everyone. The split is
    // by the account's role (server-side, from /api/me), not by
    // a separate admin login page — admin accounts go to /admin,
    // customer accounts go to /create, from the same email/password.
    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
    const json = (await res.json()) as { role?: string };
    setLoading(false);
    router.push(res.ok && json.role === "admin" ? "/admin" : "/create");
  }

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 px-6 py-10 md:grid-cols-2">
      <PlatformAbout />
      <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="text-sm leading-6 text-thukha-indigo/70">
        Email နဲ့ password နဲ့ login လုပ်ပါ။ Account ရဲ့ role ပေါ် မူတည်ပြီး
        Admin ဆိုရင် /admin ကို၊ Customer ဆိုရင် /create ကို အလိုလို သွားမယ်။
      </p>
      <label className="text-sm font-bold text-thukha-indigo">
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={`${inputClass} mt-1`} />
      </label>
      <label className="text-sm font-bold text-thukha-indigo">
        Password
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={`${inputClass} mt-1`} />
      </label>
      {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-300">{error}</p>}
      <button type="button" onClick={login} disabled={loading} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
        {loading ? "Login လုပ်နေပါတယ်…" : "Login"}
      </button>
      <p className="text-sm text-thukha-indigo/70">
        Account မရှိသေးရင် <Link href="/signup" className="font-bold text-thukha-violet">Signup လုပ်ပါ</Link>
      </p>
      </div>
    </main>
  );
}

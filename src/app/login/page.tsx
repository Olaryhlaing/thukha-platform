"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

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
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="leading-7 text-thukha-indigo/70">
          Supabase မချိတ်သေးပါ — .env.local (ဒါမှမဟုတ် Vercel Env) မှာ
          NEXT_PUBLIC_SUPABASE_URL နဲ့ NEXT_PUBLIC_SUPABASE_ANON_KEY ထည့်ပြီးမှ
          login လုပ်လို့ရမယ်။ အခု guest အနေနဲ့ /create မှာ ဆက်သုံးလို့ရတယ်။
        </p>
        <Link href="/create" className="font-bold text-thukha-violet">/create ကို သွားပါ →</Link>
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
      setError("Login မအောင်ပါ။ Email / password စစ်ပြီး ထပ်ကြိုးစားပါ။");
      return;
    }
    // Strict role separation (mirror of /admin/login): an admin
    // account must use Admin Login only, never Customer Login, so
    // admin and customer sessions are never mixed on one account.
    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
    const json = (await res.json()) as { role?: string };
    setLoading(false);
    if (res.ok && json.role === "admin") {
      // Do not leave an admin session behind on the customer side.
      await supabase!.auth.signOut();
      setError("ဒီ account က Admin ဖြစ်နေတယ်။ Admin ဆိုရင် Admin Login ကိုပဲ သုံးပါ — Customer Login နဲ့ ရောမသုံးပါ။");
      return;
    }
    router.push("/create");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Customer Login</h1>
      <p className="text-sm leading-6 text-thukha-indigo/70">
        Customer အနေနဲ့ login လုပ်ပါ။ Admin ဆိုရင်{" "}
        <Link href="/admin/login" className="font-bold text-thukha-violet">Admin Login</Link>{" "}
        ကို သွားပါ။
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
    </main>
  );
}

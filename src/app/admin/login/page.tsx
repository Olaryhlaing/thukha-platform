"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white px-3 py-3 text-base text-thukha-indigo outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

/* Admin login: same Supabase email/password, then a role check.
   Admin is NOT created by signup — the owner promotes a signed-up
   user in Supabase SQL (see supabase/schema.sql). A customer who
   tries this page is signed out again with a clear error. */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Admin Login</h1>
        <p className="leading-7 text-thukha-indigo/70">
          Supabase မချိတ်သေးပါ — .env.local (ဒါမှမဟုတ် Vercel Env) မှာ
          NEXT_PUBLIC_SUPABASE_URL နဲ့ NEXT_PUBLIC_SUPABASE_ANON_KEY ထည့်ပြီးမှ
          admin login လုပ်လို့ရမယ်။
        </p>
        <Link href="/login" className="font-bold text-thukha-violet">Customer Login ကို သွားပါ →</Link>
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
        setError("Email confirm လုပ်ပြီးမှ admin login ရမယ်။ inbox ထဲက confirm link ကို နှိပ်ပါ။");
      } else if (msg.includes("invalid")) {
        setError("Admin email / password မှားနေတယ်။ သေချာ စစ်ပြီး ထပ်ကြိုးစားပါ။");
      } else {
        setError("Admin login မအောင်ပါ။ Email / password စစ်ပြီး ထပ်ကြိုးစားပါ။");
      }
      return;
    }
    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
    const json = (await res.json()) as { role?: string };
    setLoading(false);
    if (!res.ok || json.role !== "admin") {
      // Customer account: do not leave an admin session behind.
      await supabase!.auth.signOut();
      setError("ဒီ account က Admin မဟုတ်ပါ။ Customer ဆိုရင် Customer Login ကို သုံးပါ။");
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Admin Login</h1>
      <p className="text-sm leading-6 text-thukha-indigo/70">
        Admin account နဲ့ပဲ ဝင်လို့ရတယ်။ Admin ကို signup ကနေ မလုပ်ဘူး —
        အရင် signup လုပ်ထားတဲ့ user ကို owner က Supabase မှာ admin အဖြစ်
        သတ်မှတ်ပေးမှ ဒီမှာ ဝင်လို့ရတယ်။
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
        {loading ? "Login လုပ်နေပါတယ်…" : "Admin Login"}
      </button>
      <p className="text-sm text-thukha-indigo/70">
        Customer ဆိုရင် <Link href="/login" className="font-bold text-thukha-violet">Customer Login</Link> ကို သုံးပါ။
      </p>
    </main>
  );
}

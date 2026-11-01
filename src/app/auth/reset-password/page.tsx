"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white px-3 py-3 text-base text-thukha-indigo outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

/* Reset-password landing page. The email link carries a recovery
   session in one of two shapes (same as /auth/confirm):
   - ?code=… (PKCE): exchange it for a session explicitly.
   - #access_token=…&type=recovery (hash): supabase-js auto-detects
     it, so a getSession check finds the session.
   Only with a session can the new password be set — without one
   the page shows an expired/invalid error with a next step, never
   a form that silently fails. After a successful update the user
   is signed out, so they log in fresh with the new password. */
function ResetInner() {
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"working" | "form" | "done" | "error">(
    supabaseConfigured() ? "working" : "error",
  );
  const [error, setError] = useState(
    supabaseConfigured() ? "" : "Supabase မချိတ်သေးပါ။",
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const code = searchParams.get("code");
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashError = hash.get("error_description") ?? searchParams.get("error_description");
    if (hashError) {
      // One-time auth-link decision, not a render loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("error");
      const lower = hashError.toLowerCase();
      setError(
        lower.includes("expired")
          ? "Reset link သက်တမ်း ကုန်သွားပြီ။ /forgot-password ကနေ link အသစ် ထပ်တောင်းပါ။"
          : "Reset link မမှန်ပါ / သုံးပြီးသား ဖြစ်နေတယ်။ /forgot-password ကနေ link အသစ် ထပ်တောင်းပါ။",
      );
      return;
    }
    (async () => {
      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code);
        if (err) {
          setPhase("error");
          setError("Reset link သက်တမ်း ကုန်သွားပြီ / မမှန်ပါ။ /forgot-password ကနေ link အသစ် ထပ်တောင်းပါ။");
          return;
        }
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setPhase("form");
      } else {
        setPhase("error");
        setError("Reset link ကနေ session မရပါ။ Email ထဲက link အသစ်ကို နှိပ်ပါ၊ ဒါမှမဟုတ် /forgot-password ကနေ link အသစ် ထပ်တောင်းပါ။");
      }
    })();
  }, [searchParams]);

  async function updatePassword() {
    if (password.length < 8) {
      setError("Password အသစ်က အနည်းဆုံး ၈ လုံး ဖြစ်ရမယ်။");
      return;
    }
    if (password !== confirm) {
      setError("Password နှစ်ခု မတူပါ။ သေချာ စစ်ပြီး ထပ်ရိုက်ပါ။");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = getSupabase();
    const { error: err } = await supabase!.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("same") || msg.includes("different")) {
        setError("Password အသစ်က အဟောင်းနဲ့ မတူရမယ်။ တခြား password တစ်ခု သုံးပါ။");
      } else if (msg.includes("weak") || msg.includes("short")) {
        setError("Password အားနည်းနေတယ်။ အနည်းဆုံး ၈ လုံး၊ စာလုံး + ဂဏန်း ရောသုံးပါ။");
      } else {
        setError("Password ပြောင်းလို့ မရပါ။ Link သက်တမ်း ကုန်သွားရင် /forgot-password ကနေ link အသစ် ထပ်တောင်းပါ။");
      }
      return;
    }
    // Recovery sessions must not linger: sign out so the next
    // login uses the new password like a normal login.
    await supabase!.auth.signOut();
    setPhase("done");
  }

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Password အသစ် သတ်မှတ်ပါ</h1>
        <p className="leading-7 text-thukha-indigo/70">Supabase မချိတ်သေးပါ။</p>
        <Link href="/login" className="font-bold text-thukha-violet">Login ကို သွားပါ →</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Password အသစ် သတ်မှတ်ပါ</h1>
      {phase === "working" && (
        <p className="leading-7 text-thukha-indigo/70">Reset link ကို စစ်နေပါတယ်… ခဏစောင့်ပါ။</p>
      )}
      {phase === "form" && (
        <>
          <p className="text-sm leading-6 text-thukha-indigo/70">
            Password အသစ်ကို ရိုက်ပါ — အနည်းဆုံး ၈ လုံး ဖြစ်ရမယ်။
          </p>
          <label className="text-sm font-bold text-thukha-indigo">
            Password အသစ်
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-bold text-thukha-indigo">
            Password အသစ် (ထပ်ရိုက်)
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" className={`${inputClass} mt-1`} />
          </label>
          {error && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-300">{error}</p>}
          <button type="button" onClick={updatePassword} disabled={loading} className="min-h-[44px] rounded-full bg-thukha-violet px-6 py-3 font-bold text-white disabled:opacity-50">
            {loading ? "ပြောင်းနေပါတယ်…" : "Password ပြောင်းပါ"}
          </button>
        </>
      )}
      {phase === "done" && (
        <>
          <p className="rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900 ring-1 ring-teal-300">
            Password ပြောင်းပြီးပြီ။ Password အသစ်နဲ့ login လုပ်ပါ။
          </p>
          <Link href="/login" className="font-bold text-thukha-violet">Login ကို သွားပါ →</Link>
        </>
      )}
      {phase === "error" && (
        <>
          <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900 ring-1 ring-amber-300">{error}</p>
          <p className="text-sm text-thukha-indigo/70">
            <Link href="/forgot-password" className="font-bold text-thukha-violet">Reset link အသစ် တောင်းပါ</Link>
            {" · "}
            <Link href="/login" className="font-bold text-thukha-violet">Login လုပ်ပါ</Link>
          </p>
        </>
      )}
    </main>
  );
}

export default function AuthResetPasswordPage() {
  return (
    <Suspense fallback={<main className="mx-auto flex w-full max-w-md flex-1 px-6 py-10"><p className="text-sm text-thukha-indigo/70">Reset link ကို စစ်နေပါတယ်…</p></main>}>
      <ResetInner />
    </Suspense>
  );
}

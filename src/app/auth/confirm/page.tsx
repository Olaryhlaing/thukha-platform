"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase/client";

/* Email-confirmation landing page. Supabase sends one of two link
   shapes, and both must work or confirmation silently fails:
   - ?code=… (PKCE): exchange it for a session explicitly.
   - #access_token=…&type=signup (hash): supabase-js auto-detects
     it on client creation, so a getSession check finds the session.
   Errors are shown in Burmese with a next step (resend / login),
   never a blank page. On success the customer goes to /create —
   the same place a no-confirmation signup goes. */
function ConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "done" | "error">(
    supabaseConfigured() ? "working" : "error",
  );
  const [error, setError] = useState(
    supabaseConfigured() ? "" : "Supabase မချိတ်သေးပါ။",
  );

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const code = searchParams.get("code");
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashError = hash.get("error_description") ?? searchParams.get("error_description");
    if (hashError) {
      // One-time auth-link decision, not a render loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      const lower = hashError.toLowerCase();
      if (lower.includes("expired")) {
        setError("Confirm link သက်တမ်း ကုန်သွားပြီ။ Signup စာမျက်နှာကနေ Confirm email ပြန်ပို့ပြီး link အသစ်နဲ့ ထပ်ကြိုးစားပါ။");
      } else {
        setError("Confirm link မမှန်ပါ / သုံးပြီးသား ဖြစ်နေတယ်။ Login လုပ်ကြည့်ပါ၊ မရရင် Signup ကနေ ပြန်စပါ။");
      }
      return;
    }
    (async () => {
      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code);
        if (err) {
          setStatus("error");
          setError("Confirm link သက်တမ်း ကုန်သွားပြီ / မမှန်ပါ။ Signup စာမျက်နှာကနေ Confirm email ပြန်ပို့ပါ။");
          return;
        }
      }
      // Hash links (and exchanged codes) land here as a session.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setStatus("done");
        router.replace("/create");
      } else {
        setStatus("error");
        setError("Confirm link ကနေ session မရပါ။ Email ထဲက link အသစ်ကို နှိပ်ပါ၊ ဒါမှမဟုတ် Signup ကနေ Confirm email ပြန်ပို့ပါ။");
      }
    })();
  }, [router, searchParams]);

  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
        <h1 className="text-3xl font-bold">Email အတည်ပြုခြင်း</h1>
        <p className="leading-7 text-thukha-indigo/70">Supabase မချိတ်သေးပါ။</p>
        <Link href="/login" className="font-bold text-thukha-violet">Login ကို သွားပါ →</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-10">
      <h1 className="text-3xl font-bold">Email အတည်ပြုခြင်း</h1>
      {status === "working" && (
        <p className="leading-7 text-thukha-indigo/70">Email ကို အတည်ပြုနေပါတယ်… ခဏစောင့်ပါ။</p>
      )}
      {status === "done" && (
        <p className="leading-7 text-thukha-indigo/70">Email အတည်ပြုပြီးပြီ — /create ကို သွားနေပါတယ်…</p>
      )}
      {status === "error" && (
        <>
          <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900 ring-1 ring-amber-300">{error}</p>
          <p className="text-sm text-thukha-indigo/70">
            <Link href="/signup" className="font-bold text-thukha-violet">Signup ကို သွားပါ</Link>
            {" · "}
            <Link href="/login" className="font-bold text-thukha-violet">Login လုပ်ပါ</Link>
          </p>
        </>
      )}
    </main>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<main className="mx-auto flex w-full max-w-md flex-1 px-6 py-10"><p className="text-sm text-thukha-indigo/70">Email ကို အတည်ပြုနေပါတယ်…</p></main>}>
      <ConfirmInner />
    </Suspense>
  );
}

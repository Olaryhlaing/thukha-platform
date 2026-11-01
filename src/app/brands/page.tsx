"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import { BUSINESS_TYPES_FALLBACK } from "@/lib/brands";

type Brand = { id: string; name: string; business_type: string | null };

const inputClass =
  "w-full rounded-xl border border-thukha-lilac/50 bg-white px-3 py-3 text-base text-thukha-indigo outline-none focus:border-thukha-violet focus:ring-2 focus:ring-thukha-lilac/50";

/* Brands are real now: logged-in customers save to Supabase, guests
   save to this browser (localStorage "thukha-brands"). Deleting
   removes only that customer's own brand. */
function readGuestBrands(): Brand[] {
  try {
    return JSON.parse(localStorage.getItem("thukha-brands") ?? "[]") as Brand[];
  } catch {
    return [];
  }
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(() => {
    // Guest brands load lazily (no effect needed); logged-in brands
    // load from Supabase in the effect below.
    if (typeof window === "undefined" || getSupabase()) return [];
    return readGuestBrands();
  });
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES_FALLBACK[0]);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      setLoggedIn(Boolean(token));
      if (!token) return;
      const res = await fetch("/api/brands", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as { brands?: Brand[] };
      setBrands(json.brands ?? []);
    });
  }, []);

  async function addBrand() {
    if (!name.trim()) {
      setError("Brand အမည် ရေးပေးပါ။");
      return;
    }
    setError("");
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (token) {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), businessType }),
      });
      const json = (await res.json()) as { brand?: Brand; error?: string };
      if (!res.ok || !json.brand) {
        setError(json.error ?? "Brand သိမ်းလို့ မရပါ။");
        return;
      }
      setBrands((prev) => [json.brand as Brand, ...prev]);
    } else {
      const brand: Brand = {
        id: `guest-${Date.now()}`,
        name: name.trim(),
        business_type: businessType,
      };
      const next = [brand, ...readGuestBrands()];
      localStorage.setItem("thukha-brands", JSON.stringify(next));
      setBrands(next);
    }
    setName("");
  }

  async function deleteBrand(id: string) {
    const supabase = getSupabase();
    const token = (await supabase?.auth.getSession())?.data.session?.access_token;
    if (token) {
      await fetch(`/api/brands?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      const next = readGuestBrands().filter((b) => b.id !== id);
      localStorage.setItem("thukha-brands", JSON.stringify(next));
    }
    setBrands((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold">My Brands</h1>
      <p className="leading-7 text-thukha-indigo/70">
        {loggedIn
          ? "Login ထားတယ် — Brands တွေကို Supabase ထဲ သိမ်းထားတယ်။"
          : "Guest အနေနဲ့ သုံးနေတယ် — Brands တွေကို ဒီ browser ထဲမှာပဲ သိမ်းထားတယ်။ Login လုပ်ရင် Supabase ထဲ သိမ်းမယ်။"}
      </p>
      <section className="flex flex-col gap-4 rounded-2xl border border-thukha-lilac/40 bg-white p-4 shadow-sm">
        <label className="text-sm font-bold text-thukha-indigo">
          Brand အမည်
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ဥပမာ — Yangon Kitchen" className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm font-bold text-thukha-indigo">
          လုပ်ငန်းအမျိုးအစား
          <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={`${inputClass} mt-1`}>
            {BUSINESS_TYPES_FALLBACK.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        {error && <p className="text-sm text-amber-900">{error}</p>}
        <button type="button" onClick={addBrand} className="min-h-[44px] w-fit rounded-full bg-thukha-violet px-6 py-3 font-bold text-white">
          Brand ထည့်ပါ
        </button>
      </section>
      {brands.length === 0 ? (
        <p className="leading-7 text-thukha-indigo/70">Brand မရှိသေးဘူး။ အပေါ်ကနေ ထည့်ပါ။</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {brands.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 rounded-2xl border border-thukha-lilac/40 p-4">
              <div>
                <p className="font-bold">{b.name}</p>
                <p className="text-sm text-thukha-indigo/70">{b.business_type ?? ""}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/create?brand=${encodeURIComponent(b.name)}&type=${encodeURIComponent(b.business_type ?? "")}`}
                  className="min-h-[44px] flex items-center rounded-full border-2 border-thukha-violet px-4 py-1 text-sm font-bold text-thukha-violet"
                >
                  ဒီ Brand နဲ့ ဖန်တီးပါ
                </Link>
                <button type="button" onClick={() => deleteBrand(b.id)} className="min-h-[44px] rounded-full bg-amber-100 px-4 py-1 text-sm font-bold text-amber-900">
                  ဖျက်ပါ
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

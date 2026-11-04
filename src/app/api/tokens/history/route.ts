import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Own token history: generation spending + admin refills, newest
   first. No new table — generations already log every successful
   image cost, and admin refills already log usage_events with
   event "admin_token_refill". The initial 100-token grant is NOT
   logged anywhere, so it deliberately does not appear here (the
   UI says so); history therefore does not sum to the balance. */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const [{ data: gens }, { data: refills }] = await Promise.all([
    service.from("generations").select("prompt, format, cost_tokens, created_at").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(100),
    service.from("usage_events").select("cost_tokens, created_at").eq("owner_id", user.id).eq("event", "admin_token_refill").order("created_at", { ascending: false }).limit(100),
  ]);
  type Ev = { type: string; amount: number; prompt?: string | null; format?: string | null; created_at?: string };
  const events: Ev[] = [
    ...(gens ?? []).map((g) => ({ type: "spent" as const, amount: -(g.cost_tokens ?? 0), prompt: g.prompt, format: g.format, created_at: g.created_at })),
    ...(refills ?? []).map((r) => ({ type: "refill" as const, amount: r.cost_tokens ?? 0, created_at: r.created_at })),
  ].sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? ""))).slice(0, 100);
  return NextResponse.json({ events });
}

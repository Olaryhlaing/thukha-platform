import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Admin system health, from tables that already exist. Failures
   are NOT logged (only successful generations are), so this page
   cannot show a failure rate yet — that needs failure logging
   (Batch 2). Today's count is a proxy for the Cloudflare daily
   quota (~170 images/day estimate): the provider does not expose
   exact remaining neurons via API, and if other apps share this
   Cloudflare account the real remaining quota is lower. */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) return NextResponse.json({ error: "Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။" }, { status: 401 });
  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin မဟုတ်လို့ လုပ်လို့ မရပါ။" }, { status: 403 });
  const startToday = new Date(); startToday.setUTCHours(0, 0, 0, 0);
  const [{ data: todayGens }, { data: allGens }, { count: userCount }] = await Promise.all([
    service.from("generations").select("cost_tokens").gte("created_at", startToday.toISOString()),
    service.from("generations").select("cost_tokens"),
    service.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  const today = todayGens ?? [];
  const all = allGens ?? [];
  return NextResponse.json({
    todayGenerations: today.length,
    todaySpent: today.reduce((s, g) => s + (g.cost_tokens ?? 0), 0),
    totalGenerations: all.length,
    totalSpent: all.reduce((s, g) => s + (g.cost_tokens ?? 0), 0),
    users: userCount ?? 0,
    estimatedQuotaLeft: Math.max(0, 170 - today.length),
  });
}

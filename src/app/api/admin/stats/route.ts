import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Admin-only stats. The caller must be logged in AND have
   profiles.role = 'admin' (set by the owner in Supabase SQL, never
   by signup). Returns counts and the latest generations (with
   owner_id, so the dashboard can say WHO generated each one),
   plus the user list (id, display name, role) and token balances,
   and a per-customer breakdown: for every user, how many images
   they generated and how many tokens they spent in total. The
   breakdown is computed from ALL generations, not just the latest
   20 shown below — otherwise a heavy user past the 20-row list
   would look like they spent almost nothing. */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin မဟုတ်လို့ ကြည့်လို့ မရပါ။" }, { status: 403 });
  }
  // Counts must come from count queries, NOT from the limited lists
  // below (the old code reported users=50 / generations=20 as soon
  // as the lists hit their limits — a wrong admin dashboard).
  const [profiles, balances, generations, brands, designs, usersCount, generationsCount, allGenerations] = await Promise.all([
    service.from("profiles").select("id, display_name, role, created_at").order("created_at", { ascending: false }).limit(50),
    service.from("token_balances").select("owner_id, balance"),
    service.from("generations").select("id, owner_id, prompt, model, format, cost_tokens, created_at").order("created_at", { ascending: false }).limit(20),
    service.from("brands").select("id", { count: "exact", head: true }),
    service.from("designs").select("id", { count: "exact", head: true }),
    service.from("profiles").select("id", { count: "exact", head: true }),
    service.from("generations").select("id", { count: "exact", head: true }),
    // Only owner + cost are needed for the totals (Supabase caps a
    // plain select at 1000 rows — fine for this prototype's scale;
    // a bigger launch needs a real SQL aggregate instead).
    service.from("generations").select("owner_id, cost_tokens"),
  ]);
  const balanceOf = (ownerId: string) =>
    balances.data?.find((b) => b.owner_id === ownerId)?.balance ?? null;
  // Per-customer totals: every profile, even one with 0 generations,
  // so the admin sees who has NOT generated anything either.
  // Sorted by tokens spent, heaviest first.
  const totals = new Map<string, { generations: number; spent: number }>();
  for (const g of allGenerations.data ?? []) {
    if (!g.owner_id) continue;
    const cur = totals.get(g.owner_id) ?? { generations: 0, spent: 0 };
    cur.generations += 1;
    cur.spent += g.cost_tokens ?? 0;
    totals.set(g.owner_id, cur);
  }
  const perUser = (profiles.data ?? []).map((u) => ({
    id: u.id,
    display_name: u.display_name,
    role: u.role,
    balance: balanceOf(u.id),
    generations: totals.get(u.id)?.generations ?? 0,
    spent: totals.get(u.id)?.spent ?? 0,
  })).sort((a, b) => b.spent - a.spent || b.generations - a.generations);
  return NextResponse.json({
    users: profiles.data ?? [],
    balances: balances.data ?? [],
    generations: generations.data ?? [],
    perUser,
    counts: {
      users: usersCount.count ?? 0,
      brands: brands.count ?? 0,
      designs: designs.count ?? 0,
      generations: generationsCount.count ?? 0,
    },
  });
}

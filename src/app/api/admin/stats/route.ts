import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Admin-only stats. The caller must be logged in AND have
   profiles.role = 'admin' (set by the owner in Supabase SQL, never
   by signup). Returns counts and the latest generations, plus the
   user list (id, display name, role) and token balances. */
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
  const [profiles, balances, generations, brands, designs, usersCount, generationsCount] = await Promise.all([
    service.from("profiles").select("id, display_name, role, created_at").order("created_at", { ascending: false }).limit(50),
    service.from("token_balances").select("owner_id, balance"),
    service.from("generations").select("id, prompt, model, format, cost_tokens, created_at").order("created_at", { ascending: false }).limit(20),
    service.from("brands").select("id", { count: "exact", head: true }),
    service.from("designs").select("id", { count: "exact", head: true }),
    service.from("profiles").select("id", { count: "exact", head: true }),
    service.from("generations").select("id", { count: "exact", head: true }),
  ]);
  return NextResponse.json({
    users: profiles.data ?? [],
    balances: balances.data ?? [],
    generations: generations.data ?? [],
    counts: {
      users: usersCount.count ?? 0,
      brands: brands.count ?? 0,
      designs: designs.count ?? 0,
      generations: generationsCount.count ?? 0,
    },
  });
}

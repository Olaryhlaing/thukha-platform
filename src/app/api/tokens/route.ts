import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";
import { START_TOKENS } from "@/lib/tokens";

/* Server token balance for a logged-in customer.
   GET with Authorization: Bearer <supabase access token> returns
   {balance, mode: "server"}. If Supabase is not configured or the
   user is not logged in, returns {mode: "guest"} — the client then
   keeps using browser localStorage tokens. A missing row is created
   with START_TOKENS (100), and a profiles row is created if needed. */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    // Debug reason (no secret, no token): "no_user" means the
    // browser token did not verify (expired / logged out in
    // another tab), "no_service" means server env is missing.
    // The /create client shows this reason, so a failed pill can
    // be diagnosed in one click instead of a generic message.
    return NextResponse.json({ mode: "guest" as const, reason: !user ? "no_user" : "no_service" });
  }
  // Preserve an existing display_name (e.g. the name typed at
  // signup) — the old upsert overwrote it with the email prefix
  // on every API call.
  const { data: existingProfile } = await service
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();
  if (!existingProfile) {
    await service.from("profiles").insert({
      id: user.id,
      display_name:
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split("@")[0] ??
        null,
    });
  }
  // Admin accounts are unlimited: no balance to track, never
  // deduct. Role comes from profiles via the service key — signup
  // cannot set it, only the owner SQL promotion can.
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role === "admin") {
    return NextResponse.json({ mode: "server" as const, balance: null, unlimited: true });
  }
  const { data } = await service
    .from("token_balances")
    .select("balance")
    .eq("owner_id", user.id)
    .single();
  if (!data) {
    await service
      .from("token_balances")
      .insert({ owner_id: user.id, balance: START_TOKENS });
    return NextResponse.json({ mode: "server" as const, balance: START_TOKENS, total: START_TOKENS });
  }
  // Denominator for the /create pill: total tokens ever given to
  // this customer, NOT the hardcoded 100. Balance = total - spent,
  // and spent is exactly the sum of this customer's generation
  // costs, so total = balance + spent. This is why a customer
  // refilled to 200 shows 200/200 (not 200/100), and after
  // spending 15 shows 185/200 (right side stays, left drops).
  // No schema change needed — refills are already in the balance,
  // generations are already logged with their cost. If the sum
  // query fails, fall back to max(balance, 100) so the pill can
  // never show balance > total again.
  let total = Math.max(data.balance, START_TOKENS);
  try {
    const { data: gens } = await service
      .from("generations")
      .select("cost_tokens")
      .eq("owner_id", user.id);
    if (gens) {
      const spent = gens.reduce((sum, g) => sum + (g.cost_tokens ?? 0), 0);
      total = Math.max(data.balance + spent, START_TOKENS);
    }
  } catch {
    // Fallback above already applies.
  }
  return NextResponse.json({ mode: "server" as const, balance: data.balance, total });
}

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
    return NextResponse.json({ mode: "guest" as const });
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
  const { data } = await service
    .from("token_balances")
    .select("balance")
    .eq("owner_id", user.id)
    .single();
  if (!data) {
    await service
      .from("token_balances")
      .insert({ owner_id: user.id, balance: START_TOKENS });
    return NextResponse.json({ mode: "server" as const, balance: START_TOKENS });
  }
  return NextResponse.json({ mode: "server" as const, balance: data.balance });
}

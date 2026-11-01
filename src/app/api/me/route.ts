import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Who am I: returns the logged-in user's email, role and server
   token balance. Used by /admin/login to prove admin role, and by
   the admin dashboard. Guests get 401 — they use /login instead. */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။" }, { status: 401 });
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
  const { data: profile } = await service
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();
  const { data: balanceRow } = await service
    .from("token_balances")
    .select("balance")
    .eq("owner_id", user.id)
    .single();
  return NextResponse.json({
    email: user.email,
    role: profile?.role ?? "customer",
    balance: balanceRow?.balance ?? null,
  });
}

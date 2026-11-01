import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Prototype admin token refill: an admin adds tokens to any user's
   server balance. Admin-only (profiles.role = 'admin', checked
   server-side). Amount must be a whole number from 1 to 10000.
   If the user has no balance row yet, it is created with the
   refill amount (a first-time user normally gets 100 on first
   /api/tokens call, so this path is rare). The refill is logged
   in usage_events so it is auditable. This is a prototype free
   refill — before a real launch it must be replaced by a paid
   top-up (payment + admin approval), not a free button. */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ လုပ်လို့ရမယ်။" }, { status: 401 });
  }
  const { data: profile } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin မဟုတ်လို့ လုပ်လို့ မရပါ။" }, { status: 403 });
  }
  const body = (await request.json()) as { userId?: string; amount?: number };
  const userId = (body.userId ?? "").trim();
  const amount = Math.floor(Number(body.amount));
  if (!userId) {
    return NextResponse.json({ error: "User id မရှိပါ။" }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
    return NextResponse.json({ error: "Amount က 1 ကနေ 10000 အတွင်း ဖြစ်ရမယ်။" }, { status: 400 });
  }
  const { data: existing } = await service
    .from("token_balances")
    .select("balance")
    .eq("owner_id", userId)
    .single();
  const nextBalance = (existing?.balance ?? 0) + amount;
  if (existing) {
    await service
      .from("token_balances")
      .update({ balance: nextBalance, updated_at: new Date().toISOString() })
      .eq("owner_id", userId);
  } else {
    await service
      .from("token_balances")
      .insert({ owner_id: userId, balance: nextBalance });
  }
  await service.from("usage_events").insert({
    owner_id: userId,
    event: "admin_token_refill",
    cost_tokens: amount,
  });
  return NextResponse.json({ ok: true, balance: nextBalance });
}

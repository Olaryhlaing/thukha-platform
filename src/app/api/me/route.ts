import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Who am I: returns the logged-in user's email, role and server
   token balance. Used by the unified /login page to route admins
   to /admin and customers to /create, and by the admin dashboard.
   Guests get 401 — they use /login instead. */
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
    .select("role, display_name, avatar_url, suspended")
    .eq("id", user.id)
    .single();
  const { data: balanceRow } = await service
    .from("token_balances")
    .select("balance")
    .eq("owner_id", user.id)
    .single();
  // New-customer free 100: a brand-new account has NO token_balances
  // row until some API creates one. /api/tokens and the generate
  // route already create it with 100, but /api/me did NOT — so a
  // customer who opened /account first (before /create) saw "—"
  // instead of 100, even though 100 free is the rule. Create the
  // row here too, so 100 shows everywhere from the first login.
  // Admins are unlimited and never need a balance row.
  let balance = balanceRow?.balance ?? null;
  if (balance === null && profile?.role !== "admin") {
    const { error } = await service
      .from("token_balances")
      .insert({ owner_id: user.id, balance: 100 });
    if (!error) balance = 100;
  }
  return NextResponse.json({
    email: user.email,
    display_name: profile?.display_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
    role: profile?.role ?? "customer",
    suspended: profile?.suspended ?? false,
    balance,
  });
}

export async function PATCH(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ပြင်လို့ရမယ်။" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { display_name?: string };
  const displayName = (body.display_name ?? "").trim();
  if (!displayName) {
    return NextResponse.json({ error: "အမည် ရေးပေးပါ။" }, { status: 400 });
  }
  if (displayName.length > 100) {
    return NextResponse.json({ error: "အမည် အရှည် ၁၀၀ လုံးထက် မကျော်ရပါ။" }, { status: 400 });
  }
  // ONLY display_name is updatable here — never role, never
  // token balance, never email, and never avatar_url (a picture
  // may only be set by the validated upload in /api/me/avatar,
  // never by posting an arbitrary URL here). Any other field in
  // the body is ignored, so a customer cannot promote themselves
  // to admin or change their balance through this endpoint.
  const { data: existing } = await service
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();
  if (existing) {
    const { error } = await service
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: "သိမ်း၍ မရပါ။" }, { status: 502 });
  } else {
    const { error } = await service.from("profiles").insert({
      id: user.id,
      display_name: displayName,
      role: "customer",
    });
    if (error) return NextResponse.json({ error: "သိမ်း၍ မရပါ။" }, { status: 502 });
  }
  return NextResponse.json({ display_name: displayName });
}

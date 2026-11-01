import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

async function auth(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  return { user, service };
}

export async function GET(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ Brands ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const { data, error } = await service
    .from("brands")
    .select("id, name, business_type, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Brands ဖတ်လို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ brands: data ?? [] });
}

export async function POST(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ Brand ထည့်လို့ရမယ်။" }, { status: 401 });
  }
  const body = (await request.json()) as { name?: string; businessType?: string };
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Brand အမည် ရေးပေးပါ။" }, { status: 400 });
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
  const { data, error } = await service
    .from("brands")
    .insert({ owner_id: user.id, name, business_type: body.businessType ?? null })
    .select("id, name, business_type, created_at")
    .single();
  if (error) return NextResponse.json({ error: "Brand သိမ်းလို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ brand: data });
}

export async function DELETE(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ဖျက်လို့ရမယ်။" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Brand id မရှိပါ။" }, { status: 400 });
  // Return 404 when nothing was deleted (wrong id, or another
  // customer's brand) instead of a false ok — the old code always
  // returned ok, even for a brand that was never yours.
  const { data, error } = await service
    .from("brands")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");
  if (error) return NextResponse.json({ error: "Brand ဖျက်လို့ မရပါ။" }, { status: 502 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "ဒီ Brand ကို မတွေ့ပါ။" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

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
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ကိုယ်ပိုင် Template များ ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const { data, error } = await service
    .from("user_templates")
    .select("id, name, business_type, goal, channel, headline, subheadline, prompt, is_favorite, created_at")
    .eq("owner_id", user.id)
    .order("is_favorite", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: "Template များ ဖတ်လို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ Template သိမ်းလို့ရမယ်။" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    businessType?: string;
    goal?: string;
    channel?: string;
    headline?: string;
    subheadline?: string;
    prompt?: string;
    isFavorite?: boolean;
  };
  const name = (body.name ?? "").trim();
  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Template အမည် ရေးပေးပါ (စာလုံး 120 ထက် မကျော်ရပါ)။" }, { status: 400 });
  }

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
    .from("user_templates")
    .insert({
      owner_id: user.id,
      name,
      business_type: body.businessType ?? null,
      goal: body.goal ?? null,
      channel: body.channel ?? null,
      headline: body.headline ?? null,
      subheadline: body.subheadline ?? null,
      prompt: body.prompt ?? null,
      is_favorite: body.isFavorite === true,
    })
    .select("id, name, business_type, goal, channel, headline, subheadline, prompt, is_favorite, created_at")
    .single();
  if (error || !data) return NextResponse.json({ error: "Template သိမ်းလို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ template: data });
}

export async function PATCH(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ပြင်လို့ရမယ်။" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    is_favorite?: boolean;
  };
  const id = (body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "Template id မရှိပါ။" }, { status: 400 });
  const isFavorite = body.is_favorite === true;
  const { data, error } = await service
    .from("user_templates")
    .update({ is_favorite: isFavorite })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id, is_favorite")
    .single();
  if (error || !data) return NextResponse.json({ error: "Template ကို မတွေ့ပါ။" }, { status: 404 });
  return NextResponse.json({ ok: true, is_favorite: data.is_favorite });
}

export async function DELETE(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ဖျက်လို့ရမယ်။" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Template id မရှိပါ။" }, { status: 400 });
  const { data, error } = await service
    .from("user_templates")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");
  if (error) return NextResponse.json({ error: "Template ဖျက်လို့ မရပါ။" }, { status: 502 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "ဒီ Template ကို မတွေ့ပါ။" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
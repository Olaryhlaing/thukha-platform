import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Designs are saved prompt records (not image blobs — image storage
   in a Storage bucket is the next step). A design stores prompt,
   channel, format and cost, so it can be re-created from /create. */
async function auth(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  return { user, service };
}

export async function GET(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ Designs ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const { data, error } = await service
    .from("designs")
    .select("id, prompt, channel, format, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Designs ဖတ်လို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ designs: data ?? [] });
}

export async function POST(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ Design သိမ်းလို့ရမယ်။" }, { status: 401 });
  }
  const body = (await request.json()) as {
    prompt?: string;
    channel?: string;
    format?: string;
  };
  const prompt = (body.prompt ?? "").trim();
  if (!prompt) return NextResponse.json({ error: "Prompt မရှိပါ။" }, { status: 400 });
  await service.from("profiles").upsert(
    { id: user.id, display_name: user.email?.split("@")[0] ?? null },
    { onConflict: "id" },
  );
  const { data, error } = await service
    .from("designs")
    .insert({
      owner_id: user.id,
      prompt,
      channel: body.channel ?? null,
      format: body.format ?? null,
    })
    .select("id, prompt, channel, format, created_at")
    .single();
  if (error) return NextResponse.json({ error: "Design သိမ်းလို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ design: data });
}

export async function DELETE(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ဖျက်လို့ရမယ်။" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Design id မရှိပါ။" }, { status: 400 });
  await service.from("designs").delete().eq("id", id).eq("owner_id", user.id);
  return NextResponse.json({ ok: true });
}

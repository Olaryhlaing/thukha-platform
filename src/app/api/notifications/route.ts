import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Own in-app notifications (header bell).
   GET: newest first (latest 50) + unread count.
   PATCH: { id } marks one notification read, { all: true } marks
   all of mine read. A user can only touch their own rows. */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const { data, error } = await service
    .from("notifications")
    .select("id, type, detail, link, is_read, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: "Notification ဖတ်လို့ မရပါ။" }, { status: 502 });
  const unread = (data ?? []).filter((n) => !n.is_read).length;
  return NextResponse.json({ notifications: data ?? [], unread });
}

export async function PATCH(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ လုပ်လို့ရမယ်။" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { id?: string; all?: boolean };
  if (body.all === true) {
    const { error } = await service
      .from("notifications")
      .update({ is_read: true })
      .eq("owner_id", user.id)
      .eq("is_read", false);
    if (error) return NextResponse.json({ error: "ဖတ်ပြီးလို့ မှတ်၍ မရပါ။" }, { status: 502 });
    return NextResponse.json({ ok: true });
  }
  const id = (body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "Notification id မရှိပါ။" }, { status: 400 });
  const { error } = await service
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("owner_id", user.id);
  if (error) return NextResponse.json({ error: "ဖတ်ပြီးလို့ မှတ်၍ မရပါ။" }, { status: 502 });
  return NextResponse.json({ ok: true });
}

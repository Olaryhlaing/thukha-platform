import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { notifyCustomers } from "@/lib/notify";

async function admin(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) return null;
  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return { user, service };
}

/* Admin announcement list (active + inactive, for management). */
export async function GET(request: Request) {
  const a = await admin(request);
  if (!a) return NextResponse.json({ error: "Admin မဟုတ်လို့ ကြည့်လို့ မရပါ။" }, { status: 403 });
  const { data } = await a.service.from("announcements").select("id, title, body, active, created_at").order("created_at", { ascending: false }).limit(50);
  return NextResponse.json({ announcements: data ?? [] });
}

/* Admin create an announcement. Deactivation (not deletion)
   keeps history — see PATCH. */
export async function POST(request: Request) {
  const a = await admin(request);
  if (!a) return NextResponse.json({ error: "Admin မဟုတ်လို့ လုပ်လို့ မရပါ။" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { title?: string; body?: string };
  const title = (body.title ?? "").trim();
  const bodyText = (body.body ?? "").trim();
  if (!title || !bodyText) return NextResponse.json({ error: "Title နဲ့ Body နှစ်ခုလုံး ရေးပေးပါ။" }, { status: 400 });
  if (title.length > 200 || bodyText.length > 2000) return NextResponse.json({ error: "Title 200 လုံး၊ Body 2000 လုံးထက် မကျော်ရပါ။" }, { status: 400 });
  const { data, error } = await a.service.from("announcements").insert({ title, body: bodyText, active: true, created_by: a.user.id }).select("id").single();
  if (error || !data) return NextResponse.json({ error: "Announcement သိမ်း၍ မရပါ။" }, { status: 502 });
  await logAudit(a.service, a.user.id, "announcement_create", data.id, title);
  await notifyCustomers(a.service, "announcement", title, "/create");
  return NextResponse.json({ ok: true, id: data.id });
}

/* Admin activate / deactivate an announcement. */
export async function PATCH(request: Request) {
  const a = await admin(request);
  if (!a) return NextResponse.json({ error: "Admin မဟုတ်လို့ လုပ်လို့ မရပါ။" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { id?: string; active?: boolean };
  const id = (body.id ?? "").trim();
  const active = body.active === true;
  if (!id) return NextResponse.json({ error: "Announcement id မရှိပါ။" }, { status: 400 });
  const { data, error } = await a.service.from("announcements").update({ active }).eq("id", id).select("id, title").single();
  if (error || !data) return NextResponse.json({ error: "Announcement ကို မတွေ့ပါ။" }, { status: 404 });
  await logAudit(a.service, a.user.id, active ? "announcement_activate" : "announcement_deactivate", id, data.title ?? null);
  return NextResponse.json({ ok: true, active });
}

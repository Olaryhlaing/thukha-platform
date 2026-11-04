import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

/* Admin suspend / unsuspend a customer. Cannot suspend yourself
   and cannot suspend another admin — an admin lockout would
   leave no one to unsuspend. Suspended customers can still log
   in and view /account (so they see the suspension), but the
   generate route blocks them with 403. */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) return NextResponse.json({ error: "Login လုပ်ပြီးမှ လုပ်လို့ရမယ်။" }, { status: 401 });
  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin မဟုတ်လို့ လုပ်လို့ မရပါ။" }, { status: 403 });
  const a = { user, service };
  const body = (await request.json().catch(() => ({}))) as { userId?: string; suspended?: boolean };
  const userId = (body.userId ?? "").trim();
  const suspended = body.suspended === true;
  if (!userId) return NextResponse.json({ error: "User id မရှိပါ။" }, { status: 400 });
  if (userId === user.id) return NextResponse.json({ error: "ကိုယ့်ကိုယ်ကို Suspend လုပ်လို့ မရပါ။" }, { status: 400 });
  const { data: target } = await service.from("profiles").select("id, role, display_name").eq("id", userId).single();
  if (!target) return NextResponse.json({ error: "ဒီ user ကို မတွေ့ပါ။" }, { status: 404 });
  if (target.role === "admin") return NextResponse.json({ error: "Admin ကို Suspend လုပ်လို့ မရပါ။" }, { status: 400 });
  const { error } = await service.from("profiles").update({ suspended }).eq("id", userId);
  if (error) return NextResponse.json({ error: "Suspend ပြောင်းလို့ မရပါ။" }, { status: 502 });
  await logAudit(service, user.id, suspended ? "suspend" : "unsuspend", userId, target.display_name ?? null);
  return NextResponse.json({ ok: true, suspended });
}

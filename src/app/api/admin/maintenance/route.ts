import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

/* Admin-only maintenance switch: temporarily close login + signup
   for customers. Admins can still log in — the login page checks
   the role after sign-in and only turns customers away — so the
   admin can always get back in to reopen it. */
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
  const body = (await request.json().catch(() => ({}))) as { maintenance?: boolean };
  const on = body.maintenance === true;
  const { error } = await service.from("app_settings").upsert(
    { key: "maintenance", value: on ? "true" : "false", updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) return NextResponse.json({ error: "သိမ်း၍ မရပါ။ ထပ်ကြိုးစားပါ။" }, { status: 502 });
  await logAudit(service, user.id, on ? "maintenance_on" : "maintenance_off", null, null);
  return NextResponse.json({ ok: true, maintenance: on });
}

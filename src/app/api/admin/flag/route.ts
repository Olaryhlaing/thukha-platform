import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

/* Admin flag / unflag a generation for review. Flagging does NOT
   delete it and does NOT hide it from its owner — it only marks
   it in the admin list. Deletion stays a separate, audited action. */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) return NextResponse.json({ error: "Login လုပ်ပြီးမှ လုပ်လို့ရမယ်။" }, { status: 401 });
  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin မဟုတ်လို့ လုပ်လို့ မရပါ။" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { id?: string; flagged?: boolean };
  const id = (body.id ?? "").trim();
  const flagged = body.flagged === true;
  if (!id) return NextResponse.json({ error: "Generation id မရှိပါ။" }, { status: 400 });
  const { data: gen, error } = await service.from("generations").update({ flagged }).eq("id", id).select("id, owner_id").single();
  if (error || !gen) return NextResponse.json({ error: "ဒီ generation ကို မတွေ့ပါ။" }, { status: 404 });
  await logAudit(service, user.id, flagged ? "flag" : "unflag", id, gen.owner_id ?? null);
  return NextResponse.json({ ok: true, flagged });
}

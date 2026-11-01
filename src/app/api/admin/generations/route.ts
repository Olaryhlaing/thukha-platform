import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Admin-only generation delete: removes one generations log row
   (prompt/model/cost record only — images are never stored as
   blobs, so there is nothing else to clean up). Admin-only
   (profiles.role = 'admin', checked server-side, 403 otherwise).
   Deleting the log does NOT refund tokens — a refund, if ever
   wanted, is a separate token_balances change. Returns 404 when
   the id does not exist, so the client only removes the row
   locally on a real server delete. */
export async function DELETE(request: Request) {
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
  const body = (await request.json()) as { id?: string };
  const id = (body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Generation id မရှိပါ။" }, { status: 400 });
  }
  const { data: deleted, error } = await service
    .from("generations")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error || !deleted) {
    return NextResponse.json({ error: "ဒီ generation ကို မတွေ့ပါ။" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

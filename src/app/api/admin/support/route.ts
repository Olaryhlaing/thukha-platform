import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

/* Admin support inbox: every customer's ticket, newest first,
   with the owner's display name. PATCH answers a ticket: set
   admin_reply (up to 2000 chars) and/or status. Replying sets
   the ticket to in_progress unless the admin marks it resolved.
   Both actions are audit-logged (support_reply / support_status),
   target = the ticket id. */
const STATUSES = ["open", "in_progress", "resolved"] as const;

async function requireAdmin(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) return { error: NextResponse.json({ error: "Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။" }, { status: 401 }) };
  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: NextResponse.json({ error: "Admin မဟုတ်လို့ ကြည့်လို့ မရပါ။" }, { status: 403 }) };
  return { user, service };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { service } = auth;
  const { data, error } = await service
    .from("support_tickets")
    .select("id, owner_id, category, subject, message, status, admin_reply, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: "Ticket ဖတ်လို့ မရပါ။" }, { status: 502 });
  const ids = [...new Set((data ?? []).map((t) => t.owner_id))];
  const { data: users } = ids.length
    ? await service.from("profiles").select("id, display_name").in("id", ids)
    : { data: [] as { id: string; display_name: string | null }[] };
  const names = new Map((users ?? []).map((u) => [u.id, u.display_name]));
  return NextResponse.json({
    tickets: (data ?? []).map((t) => ({ ...t, owner_name: names.get(t.owner_id) ?? null })),
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { user, service } = auth;
  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    admin_reply?: string;
    status?: string;
  };
  const id = (body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "Ticket id မရှိပါ။" }, { status: 400 });
  const update: { admin_reply?: string; status?: string; updated_at?: string } = {};
  let replied = false;
  if (body.admin_reply !== undefined) {
    const reply = body.admin_reply.trim();
    if (reply.length > 2000) return NextResponse.json({ error: "အဖြေ စာလုံး 2000 ထက် မကျော်ရပါ။" }, { status: 400 });
    update.admin_reply = reply;
    replied = true;
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
      return NextResponse.json({ error: "Status မမှန်ပါ။" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "ပြင်စရာ မရှိပါ။" }, { status: 400 });
  }
  if (replied && !update.status) update.status = "in_progress";
  update.updated_at = new Date().toISOString();
  const { data, error } = await service
    .from("support_tickets")
    .update(update)
    .eq("id", id)
    .select("id, owner_id, subject, status")
    .single();
  if (error || !data) return NextResponse.json({ error: "Ticket ပြင်၍ မရပါ။" }, { status: 502 });
  if (replied) await logAudit(service, user.id, "support_reply", id, data.subject);
  if (update.status) await logAudit(service, user.id, "support_status", id, `${data.subject} → ${update.status}`);
  return NextResponse.json({ ok: true, status: data.status });
}

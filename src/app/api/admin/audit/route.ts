import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Admin audit log view: latest 100 actions, with actor and
   target display names resolved (names are a snapshot for
   reading only — the ids are the record). */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) return NextResponse.json({ error: "Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။" }, { status: 401 });
  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin မဟုတ်လို့ ကြည့်လို့ မရပါ။" }, { status: 403 });
  const { data: logs } = await service.from("audit_logs").select("id, actor_id, action, target_id, detail, created_at").order("created_at", { ascending: false }).limit(100);
  const ids = new Set<string>();
  for (const l of logs ?? []) {
    if (l.actor_id) ids.add(l.actor_id);
    if (l.target_id) ids.add(l.target_id);
  }
  const { data: users } = ids.size
    ? await service.from("profiles").select("id, display_name").in("id", [...ids])
    : { data: [] as { id: string; display_name: string | null }[] };
  const names = new Map((users ?? []).map((u) => [u.id, u.display_name]));
  return NextResponse.json({
    logs: (logs ?? []).map((l) => ({
      ...l,
      actor_name: l.actor_id ? (names.get(l.actor_id) ?? null) : null,
      target_name: l.target_id ? (names.get(l.target_id) ?? null) : null,
    })),
  });
}

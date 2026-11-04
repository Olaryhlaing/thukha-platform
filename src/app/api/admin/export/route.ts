import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",") + "\r\n";
}

/* Admin-only CSV export. Downloads in the admin's browser only;
   nothing is sent elsewhere. ?type=users (one row per customer:
   name, role, balance, generations, spent) or ?type=generations
   (one row per generation log, prompt included — store securely). */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) return NextResponse.json({ error: "Login လုပ်ပြီးမှ လုပ်လို့ရမယ်။" }, { status: 401 });
  const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Admin မဟုတ်လို့ လုပ်လို့ မရပါ။" }, { status: 403 });
  const type = new URL(request.url).searchParams.get("type");
  const today = new Date().toISOString().slice(0, 10);
  if (type === "users") {
    const [{ data: users }, { data: balances }, { data: gens }] = await Promise.all([
      service.from("profiles").select("id, display_name, role, created_at").order("created_at", { ascending: false }),
      service.from("token_balances").select("owner_id, balance"),
      service.from("generations").select("owner_id, cost_tokens"),
    ]);
    const bal = new Map((balances ?? []).map((b) => [b.owner_id, b.balance]));
    const agg = new Map<string, { n: number; spent: number }>();
    for (const g of gens ?? []) {
      const cur = agg.get(g.owner_id ?? "") ?? { n: 0, spent: 0 };
      cur.n += 1; cur.spent += g.cost_tokens ?? 0; agg.set(g.owner_id ?? "", cur);
    }
    let csv = csvRow(["id", "display_name", "role", "balance", "generations", "spent", "created_at"]);
    for (const u of users ?? []) {
      const ag = agg.get(u.id) ?? { n: 0, spent: 0 };
      csv += csvRow([u.id, u.display_name, u.role, bal.get(u.id) ?? "", ag.n, ag.spent, u.created_at]);
    }
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="thukha-users-${today}.csv"` } });
  }
  if (type === "generations") {
    const [{ data: gens }, { data: users }] = await Promise.all([
      service.from("generations").select("id, owner_id, prompt, model, format, cost_tokens, created_at").order("created_at", { ascending: false }).limit(1000),
      service.from("profiles").select("id, display_name"),
    ]);
    const names = new Map((users ?? []).map((u) => [u.id, u.display_name]));
    let csv = csvRow(["id", "owner_id", "owner_name", "prompt", "model", "format", "cost_tokens", "created_at"]);
    for (const g of gens ?? []) {
      csv += csvRow([g.id, g.owner_id, names.get(g.owner_id ?? "") ?? "", g.prompt, g.model, g.format, g.cost_tokens, g.created_at]);
    }
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="thukha-generations-${today}.csv"` } });
  }
  return NextResponse.json({ error: "type က users ဒါမှမဟုတ် generations ဖြစ်ရမယ်။" }, { status: 400 });
}

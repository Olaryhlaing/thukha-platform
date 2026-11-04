import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Own generation history: every successful image this customer
   generated, newest first. Images themselves are NOT stored (see
   designs: prompt records only), so this list can recreate a
   prompt from /create, but cannot re-download an old image —
   that needs the saved-images Storage step (Batch 3). */
export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const { data, error } = await service
    .from("generations")
    .select("id, prompt, model, format, cost_tokens, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: "History ဖတ်လို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ generations: data ?? [] });
}

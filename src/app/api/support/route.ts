import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Customer support tickets (own only).
   GET: my tickets, newest first, with the admin reply when present.
   POST: open a new ticket. Login required — a ticket needs an
   owner, so guests cannot open one (they can still read the FAQ
   on /support without logging in). No email is sent; the customer
   sees the admin reply on /support. */
const CATEGORIES = ["token", "image", "download", "account", "payment", "other"] as const;

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const { data, error } = await service
    .from("support_tickets")
    .select("id, category, subject, message, status, admin_reply, created_at, updated_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: "Ticket ဖတ်လို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ tickets: data ?? [] });
}

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ပို့လို့ရမယ်။" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    category?: string;
    subject?: string;
    message?: string;
  };
  const category = (body.category ?? "").trim();
  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return NextResponse.json({ error: "အမျိုးအစား ရွေးပေးပါ။" }, { status: 400 });
  }
  if (!subject || subject.length > 200) {
    return NextResponse.json({ error: "ခေါင်းစဉ် ရေးပေးပါ (စာလုံး 200 ထက် မကျော်ရပါ)။" }, { status: 400 });
  }
  if (!message || message.length > 2000) {
    return NextResponse.json({ error: "အကူအညီလိုတဲ့ အကြောင်း ရေးပေးပါ (စာလုံး 2000 ထက် မကျော်ရပါ)။" }, { status: 400 });
  }
  const { data, error } = await service
    .from("support_tickets")
    .insert({ owner_id: user.id, category, subject, message, status: "open" })
    .select("id")
    .single();
  if (error || !data) return NextResponse.json({ error: "Ticket ပို့၍ မရပါ။" }, { status: 502 });
  return NextResponse.json({ id: data.id });
}

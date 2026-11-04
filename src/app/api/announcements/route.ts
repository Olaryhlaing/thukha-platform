import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/* Public broadcast read: only ACTIVE announcements, newest
   first. No private data in an announcement — title/body are
   written by an admin for all customers, so no auth is needed
   to read them (the same banner shows to guests on /create). */
export async function GET() {
  const service = getServiceSupabase();
  if (!service) return NextResponse.json({ announcements: [] });
  const { data } = await service.from("announcements").select("id, title, body, created_at").eq("active", true).order("created_at", { ascending: false }).limit(10);
  return NextResponse.json({ announcements: data ?? [] });
}

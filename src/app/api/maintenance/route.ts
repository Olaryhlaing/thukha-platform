import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/* Public maintenance flag — the login and signup pages read this
   before anyone is logged in, so it cannot require a session.
   Missing row means maintenance is off. */
export async function GET() {
  const service = getServiceSupabase();
  if (!service) return NextResponse.json({ maintenance: false });
  const { data } = await service
    .from("app_settings")
    .select("value")
    .eq("key", "maintenance")
    .single();
  return NextResponse.json({ maintenance: data?.value === "true" });
}

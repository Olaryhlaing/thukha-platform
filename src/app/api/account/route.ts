import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Delete my account (privacy: right to erasure). Deletes, in order:
   usage_events, generations, designs, brands, token_balances,
   profiles — then the Supabase Auth user itself via the service_role
   admin API. The deletes are explicit (not left to ON DELETE SET
   NULL) so a prompt log cannot survive with a null owner after
   the account is gone. Deleting the profile first and the Auth
   user last is safe: both deletes are idempotent, so if the Auth
   delete fails the customer can retry and it will finish.
   Only the account owner can call this (their own Bearer token);
   an admin cannot delete someone else's account through this route. */
export async function DELETE(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) {
    return NextResponse.json(
      { error: "Login လုပ်ပြီးမှ Account ဖျက်လို့ရမယ်။" },
      { status: 401 },
    );
  }
  const id = user.id;
  await service.from("usage_events").delete().eq("owner_id", id);
  await service.from("generations").delete().eq("owner_id", id);
  await service.from("designs").delete().eq("owner_id", id);
  await service.from("brands").delete().eq("owner_id", id);
  await service.from("token_balances").delete().eq("owner_id", id);
  await service.from("profiles").delete().eq("id", id);
  const { error: authError } = await service.auth.admin.deleteUser(id);
  if (authError) {
    console.error("Account delete: auth user delete failed", authError.message);
    return NextResponse.json(
      { error: "Account data ဖျက်ပြီးပြီ၊ ဒါပေမယ့် Login account ဖျက်လို့ မရသေးပါ။ ထပ်ကြိုးစားပါ။" },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}

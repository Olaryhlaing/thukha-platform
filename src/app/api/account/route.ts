import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

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
  try {
    const { data: avatarFiles } = await service.storage.from("avatars").list(id);
    if (avatarFiles && avatarFiles.length > 0) {
      await service.storage.from("avatars").remove(avatarFiles.map((f) => `${id}/${f.name}`));
    }
  } catch {
    // Account delete continues below regardless.
  }
  try {
    const { data: designFiles } = await service.storage.from("designs").list(id);
    if (designFiles && designFiles.length > 0) {
      await service.storage.from("designs").remove(designFiles.map((f) => `${id}/${f.name}`));
    }
  } catch {
    // Account delete continues below regardless.
  }
  try {
    const { data: logoFiles } = await service.storage.from("logos").list(id);
    if (logoFiles && logoFiles.length > 0) {
      await service.storage.from("logos").remove(logoFiles.map((f) => `${id}/${f.name}`));
    }
  } catch {
    // Account delete continues below regardless.
  }
  await service.from("usage_events").delete().eq("owner_id", id);
  await service.from("generations").delete().eq("owner_id", id);
  await service.from("designs").delete().eq("owner_id", id);
  await service.from("user_templates").delete().eq("owner_id", id);
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
import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Profile picture upload — own picture only.
   POST: multipart form, field "avatar". The browser never touches
   Storage directly (RLS is SELECT-only): this server route checks
   the caller's Bearer token, validates the file, uploads it to the
   Supabase Storage bucket "avatars" with the service_role key, and
   stores only the public URL in profiles.avatar_url. Path is always
   <user-id>/avatar.<ext>, so a new upload replaces the old one and
   a customer can never write another customer's picture.
   DELETE: removes the customer's own avatar files from Storage and
   clears profiles.avatar_url. Re-uploading restores a picture.
   Limits: JPG / PNG / WebP only, 2 MB max. No image processing is
   done server-side — the round frame crops visually with CSS
   object-cover. The bucket must be PUBLIC (owner creates it in the
   Supabase Dashboard, see the copy-in steps); a private bucket's
   public URL would not load in the header. */
const BUCKET = "avatars";
const MAX_BYTES = 2 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function auth(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  if (!user || !service) return null;
  return { user, service };
}

async function removeOwnFiles(service: NonNullable<ReturnType<typeof getServiceSupabase>>, userId: string) {
  try {
    const { data: files } = await service.storage.from(BUCKET).list(userId);
    if (files && files.length > 0) {
      await service.storage
        .from(BUCKET)
        .remove(files.map((f) => `${userId}/${f.name}`));
    }
  } catch {
    // Best-effort: a missing bucket must not block upload/delete.
  }
}

export async function POST(request: Request) {
  const a = await auth(request);
  if (!a) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ပုံ တင်လို့ရမယ်။" }, { status: 401 });
  }
  const { user, service } = a;
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "ပုံ ဖိုင် မတွေ့ပါ။ ထပ်ရွေးပေးပါ။" }, { status: 400 });
  }
  const file = form.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "ပုံ ဖိုင် မတွေ့ပါ။ ထပ်ရွေးပေးပါ။" }, { status: 400 });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json({ error: "JPG / PNG / WebP ပုံပဲ တင်လို့ရမယ်။" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "ပုံက 2MB ထက် ကြီးနေတယ်။ သေးတဲ့ ပုံ ရွေးပေးပါ။" }, { status: 400 });
  }
  // Remove any previous avatar first, so a JPG -> PNG change does
  // not leave an orphaned old file in the bucket.
  await removeOwnFiles(service, user.id);
  const path = `${user.id}/avatar.${ext}`;
  const { error: uploadError } = await service.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
    cacheControl: "3600",
  });
  if (uploadError) {
    const msg = uploadError.message.toLowerCase();
    if (msg.includes("bucket not found") || msg.includes("bucket")) {
      return NextResponse.json(
        { error: "avatars bucket မရှိသေးပါ။ Supabase Dashboard → Storage မှာ avatars ဆိုတဲ့ Public bucket အရင် လုပ်ပေးပါ။" },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "ပုံ တင်၍ မရပါ။ ထပ်ကြိုးစားပါ။" }, { status: 502 });
  }
  const base = service.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  // Cache-buster: the path never changes, so without ?v= the
  // browser/header could keep showing the old picture.
  const avatarUrl = `${base}?v=${Date.now()}`;
  const { data: existing } = await service.from("profiles").select("id").eq("id", user.id).single();
  const writeError = existing
    ? (await service.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id)).error
    : (await service.from("profiles").insert({ id: user.id, role: "customer", avatar_url: avatarUrl })).error;
  if (writeError) {
    return NextResponse.json({ error: "ပုံ URL သိမ်း၍ မရပါ။ ထပ်ကြိုးစားပါ။" }, { status: 502 });
  }
  // Best-effort: keep Auth metadata in sync, like display_name.
  try {
    await service.auth.admin.updateUserById(user.id, { user_metadata: { avatar_url: avatarUrl } });
  } catch {
    // profiles.avatar_url is the source of truth; metadata is extra.
  }
  return NextResponse.json({ avatar_url: avatarUrl });
}

export async function DELETE(request: Request) {
  const a = await auth(request);
  if (!a) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ဖျက်၍ ရမယ်။" }, { status: 401 });
  }
  const { user, service } = a;
  await removeOwnFiles(service, user.id);
  await service.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  try {
    await service.auth.admin.updateUserById(user.id, { user_metadata: { avatar_url: null } });
  } catch {
    // profiles.avatar_url is the source of truth.
  }
  return NextResponse.json({ ok: true });
}

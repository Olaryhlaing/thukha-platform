import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

/* Designs store both the prompt metadata and (when provided) the
   generated image in the public Supabase Storage bucket "designs"
   at <owner_id>/<design_id>.<ext>. */
const BUCKET = "designs";
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function parseImageDataUrl(dataUrl: string): { mime: string; ext: string; buffer: Buffer } | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const mime = match[1];
  const ext = EXT_BY_MIME[mime];
  if (!ext) return null;
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) return null;
  return { mime, ext, buffer };
}

async function auth(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const user = await getUserFromToken(token);
  const service = getServiceSupabase();
  return { user, service };
}

export async function GET(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ Designs ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const { data, error } = await service
    .from("designs")
    .select("id, prompt, channel, format, image_url, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Designs ဖတ်လို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ designs: data ?? [] });
}

export async function POST(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ Design သိမ်းလို့ရမယ်။" }, { status: 401 });
  }
  const body = (await request.json()) as {
    prompt?: string;
    channel?: string;
    format?: string;
    imageDataUrl?: string;
  };
  const prompt = (body.prompt ?? "").trim();
  if (!prompt) return NextResponse.json({ error: "Prompt မရှိပါ။" }, { status: 400 });
  // Preserve an existing display_name (e.g. the name typed at
  // signup) — the old upsert overwrote it with the email prefix
  // on every API call.
  const { data: existingProfile } = await service
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();
  if (!existingProfile) {
    await service.from("profiles").insert({
      id: user.id,
      display_name:
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split("@")[0] ??
        null,
    });
  }

  let imageUrl: string | null = null;
  if (body.imageDataUrl) {
    const parsed = parseImageDataUrl(body.imageDataUrl);
    if (!parsed) {
      return NextResponse.json({ error: "ပုံ ဖိုင်ပုံစံ မမှန်ပါ (သို့) 6MB ထက် ကြီးနေပါတယ်။" }, { status: 400 });
    }
    const fileId = crypto.randomUUID();
    const path = `${user.id}/${fileId}.${parsed.ext}`;
    const { error: uploadError } = await service.storage
      .from(BUCKET)
      .upload(path, parsed.buffer, {
        contentType: parsed.mime,
        upsert: true,
        cacheControl: "3600",
      });
    if (uploadError) {
      const msg = uploadError.message.toLowerCase();
      if (msg.includes("bucket")) {
        return NextResponse.json(
          { error: "designs bucket မရှိသေးပါ။ Supabase Dashboard → Storage မှာ designs ဆိုတဲ့ Public bucket အရင် လုပ်ပေးပါ။" },
          { status: 502 },
        );
      }
      return NextResponse.json({ error: "ပုံကို Storage ထဲ သိမ်းလို့ မရပါ။" }, { status: 502 });
    }
    imageUrl = service.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const { data, error } = await service
    .from("designs")
    .insert({
      owner_id: user.id,
      prompt,
      channel: body.channel ?? null,
      format: body.format ?? null,
      image_url: imageUrl,
    })
    .select("id, prompt, channel, format, image_url, created_at")
    .single();
  if (error) return NextResponse.json({ error: "Design သိမ်းလို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ design: data });
}

export async function DELETE(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ဖျက်လို့ရမယ်။" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Design id မရှိပါ။" }, { status: 400 });
  // Return 404 when nothing was deleted (wrong id, or another
  // customer's design) instead of a false ok — the old code always
  // returned ok, even for a design that was never yours.
  const { data, error } = await service
    .from("designs")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id, image_url");
  if (error) return NextResponse.json({ error: "Design ဖျက်လို့ မရပါ။" }, { status: 502 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "ဒီ Design ကို မတွေ့ပါ။" }, { status: 404 });
  }
  const savedUrl = data[0]?.image_url;
  if (savedUrl) {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = savedUrl.indexOf(marker);
    if (idx !== -1) {
      const storagePath = decodeURIComponent(savedUrl.slice(idx + marker.length).split("?")[0]);
      if (storagePath.startsWith(`${user.id}/`)) {
        await service.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      }
    }
  }
  return NextResponse.json({ ok: true });
}
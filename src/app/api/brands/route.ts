import { NextResponse } from "next/server";
import { getServiceSupabase, getUserFromToken } from "@/lib/supabase/server";

const BUCKET = "logos";
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function parseLogoDataUrl(dataUrl: string): { mime: string; ext: string; buffer: Buffer } | null {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const mime = match[1];
  const ext = EXT_BY_MIME[mime];
  if (!ext) return null;
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length === 0 || buffer.length > MAX_LOGO_BYTES) return null;
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
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ Brands ကြည့်လို့ရမယ်။" }, { status: 401 });
  }
  const { data, error } = await service
    .from("brands")
    .select("id, name, business_type, logo_url, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Brands ဖတ်လို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ brands: data ?? [] });
}

export async function POST(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ Brand ထည့်လို့ရမယ်။" }, { status: 401 });
  }
  const body = (await request.json()) as {
    name?: string;
    businessType?: string;
    logoDataUrl?: string;
  };
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Brand အမည် ရေးပေးပါ။" }, { status: 400 });
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

  let logoUrl: string | null = null;
  if (body.logoDataUrl) {
    if (body.logoDataUrl.startsWith("http://") || body.logoDataUrl.startsWith("https://")) {
      logoUrl = body.logoDataUrl;
    } else {
      const parsed = parseLogoDataUrl(body.logoDataUrl);
      if (!parsed) {
        return NextResponse.json({ error: "Logo ပုံက JPG / PNG / WebP ပဲ ရမယ်၊ 2MB ထက် မကျော်ရပါ။" }, { status: 400 });
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
            { error: "logos bucket မရှိသေးပါ။ Supabase Dashboard → Storage မှာ logos ဆိုတဲ့ Public bucket အရင် လုပ်ပေးပါ။" },
            { status: 502 },
          );
        }
        return NextResponse.json({ error: "Logo ပုံကို Storage ထဲ သိမ်းလို့ မရပါ။" }, { status: 502 });
      }
      logoUrl = service.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
  }

  const { data, error } = await service
    .from("brands")
    .insert({ owner_id: user.id, name, business_type: body.businessType ?? null, logo_url: logoUrl })
    .select("id, name, business_type, logo_url, created_at")
    .single();
  if (error) return NextResponse.json({ error: "Brand သိမ်းလို့ မရပါ။" }, { status: 502 });
  return NextResponse.json({ brand: data });
}

export async function DELETE(request: Request) {
  const { user, service } = await auth(request);
  if (!user || !service) {
    return NextResponse.json({ error: "Login လုပ်ပြီးမှ ဖျက်လို့ရမယ်။" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Brand id မရှိပါ။" }, { status: 400 });
  // Return 404 when nothing was deleted (wrong id, or another
  // customer's brand) instead of a false ok — the old code always
  // returned ok, even for a brand that was never yours.
  const { data, error } = await service
    .from("brands")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id, logo_url");
  if (error) return NextResponse.json({ error: "Brand ဖျက်လို့ မရပါ။" }, { status: 502 });
  if (!data || data.length === 0) {
    return NextResponse.json({ error: "ဒီ Brand ကို မတွေ့ပါ။" }, { status: 404 });
  }
  const savedLogo = data[0]?.logo_url;
  if (savedLogo) {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = savedLogo.indexOf(marker);
    if (idx !== -1) {
      const storagePath = decodeURIComponent(savedLogo.slice(idx + marker.length).split("?")[0]);
      if (storagePath.startsWith(`${user.id}/`)) {
        await service.storage.from(BUCKET).remove([storagePath]).catch(() => {});
      }
    }
  }
  return NextResponse.json({ ok: true });
}
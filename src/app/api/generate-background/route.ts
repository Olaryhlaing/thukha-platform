import { NextResponse } from "next/server";
import { tokenCost, START_TOKENS } from "@/lib/tokens";
import { stripPersonalData } from "@/lib/privacy";
import {
  getServiceSupabase,
  getUserFromToken,
} from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/* Server-token helpers (logged-in customers only). Guest customers
   keep using browser localStorage tokens — see /create. */
async function fetchServerBalance(
  service: SupabaseClient,
  user: User,
): Promise<number | null> {
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
  const { data } = await service
    .from("token_balances")
    .select("balance")
    .eq("owner_id", user.id)
    .single();
  if (data) return data.balance;
  await service
    .from("token_balances")
    .insert({ owner_id: user.id, balance: START_TOKENS });
  return START_TOKENS;
}


/* Admin check: role comes from profiles via the service key.
   Signup cannot set role='admin' — only the owner SQL promotion
   can — so this cannot be self-granted from the browser. */
async function isAdminRole(
  service: SupabaseClient,
  user: User,
): Promise<boolean> {
  const { data } = await service
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "admin";
}

/* Turn a Gemini HTTP failure into a specific Burmese message, so
   the customer is not left guessing between "key missing" (503,
   handled earlier) and "key rejected / model / quota" (502 here).
   The raw provider body is logged server-side only and never sent
   to the browser in full — only a short, safe detail for 400/404. */
async function geminiErrorMessage(res: Response): Promise<string> {
  const status = res.status;
  let detail = "";
  try {
    const text = await res.text();
    console.error("Gemini error", status, text.slice(0, 500));
    const parsed = JSON.parse(text) as {
      error?: { message?: string; status?: string };
    };
    detail = (parsed.error?.message ?? "").slice(0, 200);
  } catch {
    // Non-JSON error body — fall back to the status mapping below.
  }
  if (status === 401 || status === 403) {
    return "Gemini key မမှန်ပါ / ပိတ်ထားပါတယ်။ AI Studio မှာ key အသစ် လုပ်ပြီး .env.local မှာ GEMINI_API_KEY အသစ်ထည့်ပြီး server ပြန် run ပါ။ အရင် ပေါက်ကြားဖူးတဲ့ key ကို သုံးလို့ မရဘူး။";
  }
  if (status === 404) {
    return "Gemini model မတွေ့ပါ။ .env.local မှာ AI_BACKGROUND_MODEL=gemini-2.5-flash-image ဖြစ်မဖြစ် စစ်ပြီး server ပြန် run ပါ။";
  }
  if (status === 429) {
    return "Gemini free quota က 0 ဖြစ်နေလို့ စောင့်လည်း မရဘူး။ Cloudflare free (IMAGE_PROVIDER=cloudflare) ကို သုံးပါ၊ ဒါမှမဟုတ် Gemini billing (Tier 1) ချိတ်ပါ။";
  }
  if (status === 400 && detail) {
    return `Gemini က prompt ကို လက်မခံပါ: ${detail}`;
  }
  return `Gemini က error ပြန်လာတယ် (status ${status})။ ခဏစောင့်ပြီး ထပ်ကြိုးစားပါ။`;
}

/* Cloudflare Workers AI errors: the REST API returns JSON with an
   `errors` array, or a plain status. Map it to a specific message,
   same idea as geminiErrorMessage. */
async function cloudflareErrorMessage(res: Response): Promise<string> {
  const status = res.status;
  let detail = "";
  try {
    const text = await res.text();
    console.error("Cloudflare error", status, text.slice(0, 500));
    const parsed = JSON.parse(text) as { errors?: { message?: string }[] };
    detail = (parsed.errors?.[0]?.message ?? "").slice(0, 200);
  } catch {
    // Non-JSON body — fall back to the status mapping below.
  }
  if (status === 401 || status === 403) {
    return "Cloudflare token မမှန်ပါ / ခွင့်မရှိပါ။ .env.local မှာ CLOUDFLARE_ACCOUNT_ID နဲ့ CLOUDFLARE_API_TOKEN (Workers AI:Read) မှန်မမှန် စစ်ပြီး server ပြန် run ပါ။";
  }
  if (status === 429) {
    return "Cloudflare free neurons ကုန်သွားပြီ။ တစ်နေ့တာ limit က 00:00 UTC မှာ ပြန်ရမယ်။ ခဏစောင့်ပြီး ထပ်ကြိုးစားပါ။";
  }
  if (detail) return `Cloudflare က error ပြန်လာတယ် (status ${status}): ${detail}`;
  return `Cloudflare က error ပြန်လာတယ် (status ${status})။ ခဏစောင့်ပြီး ထပ်ကြိုးစားပါ။`;
}

/* Provider choice (see .env.example):
   IMAGE_PROVIDER=cloudflare → Cloudflare Workers AI (free, FLUX schnell)
   IMAGE_PROVIDER=gemini    → Gemini only
   unset / anything else    → auto: Cloudflare if its env is present,
                              otherwise Gemini. Cloudflare is never
   silently fallen back to Gemini, so a free request can never turn
   into a paid Gemini charge. */
function imageProvider(): "cloudflare" | "gemini" {
  const forced = (process.env.IMAGE_PROVIDER ?? "").toLowerCase().trim();
  if (forced === "cloudflare") return "cloudflare";
  if (forced === "gemini") return "gemini";
  if (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN) {
    return "cloudflare";
  }
  return "gemini";
}

export async function GET() {
  const provider = imageProvider();
  const configured =
    provider === "cloudflare"
      ? Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)
      : Boolean(process.env.GEMINI_API_KEY || process.env.AI_API_KEY);
  return NextResponse.json({ provider, configured });
}

async function chargeServer(
  service: SupabaseClient,
  user: User,
  cost: number,
  prompt: string,
  format: string,
  referenceCount: number,
  model: string,
  isAdmin: boolean,
): Promise<{ ok: boolean; serverBalance?: number; unlimited?: boolean }> {
  // Admin accounts are unlimited: never check or deduct a balance,
  // but still log the generation (cost 0) so /admin stats stay true.
  if (isAdmin) {
    await service.from("generations").insert({
      owner_id: user.id,
      prompt,
      model,
      format,
      reference_count: referenceCount,
      cost_tokens: 0,
    });
    return { ok: true, unlimited: true };
  }
  const balance = await fetchServerBalance(service, user);
  if (balance === null || balance < cost) return { ok: false };
  const next = balance - cost;
  // Atomic guard: only deduct when the balance is still >= cost at
  // update time (two concurrent requests must not both spend the
  // same tokens and push the balance negative). If this fails, the
  // caller must NOT return the image as if it were paid for.
  const { data: updated, error: updateError } = await service
    .from("token_balances")
    .update({ balance: next, updated_at: new Date().toISOString() })
    .eq("owner_id", user.id)
    .gte("balance", cost)
    .select("balance")
    .single();
  if (updateError || !updated) return { ok: false };
  // Best effort log — a log failure must not lose the image.
  await service.from("generations").insert({
    owner_id: user.id,
    prompt,
    model,
    format,
    reference_count: referenceCount,
    cost_tokens: cost,
  });
  return { ok: true, serverBalance: next };
}

/* Dev 1 API contract (DEV1-DETAILED-GUIDE.md §5) — custom AI images.
   Gemini only (2026-10-30 decision): the Gemini key stays server-only
   and never reaches the browser. The client sends a free prompt +
   style + format; this route builds the final prompt with the hard
   rules below and calls Gemini. Without a key it returns 503 and
   /create keeps working with the Violet/Lilac placeholder gradient.

   Env (see .env.example):
     GEMINI_API_KEY        Gemini key (server-only, preferred)
     AI_API_KEY            legacy fallback — treated as the Gemini key
     AI_BACKGROUND_MODEL   Gemini model, default "gemini-2.5-flash-image"
   The response includes `cost` (ThuKha tokens, see lib/tokens.ts);
   the client deducts it only when an image is actually returned.
*/

const STYLE_PROMPTS: Record<string, string> = {
  photorealistic: "photorealistic, natural light, high detail, professional photography",
  food: "appetizing food photography, warm natural light, fresh ingredients, restaurant quality",
  shop: "clean product photography, bright studio light, product centred, e-commerce style",
  beauty: "beauty and salon photography, soft flattering light, elegant and clean",
  festival: "festive Myanmar celebration scene, colourful decorations, joyful atmosphere",
  minimal: "minimal, clean composition, lots of empty space, soft colours",
  illustration: "modern flat illustration, soft colours, clean shapes, friendly style",
};

const SIZES: Record<string, string> = {
  "1080x1080": "1024x1024",
  story: "1024x1536",
  cover: "1536x1024",
};

const ASPECTS: Record<string, string> = {
  "1080x1080": "1:1",
  story: "9:16",
  cover: "16:9",
};

function parseDataUrl(dataUrl: string): { mime: string; base64: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
}

function buildPrompt(
  userPrompt: string,
  style: string,
  businessType: string,
  businessName?: string,
  goal?: string,
  channel?: string,
  hasReferences?: boolean,
  overlayText?: string,
) {
  // Privacy: nothing personal ever reaches the AI provider. Strip
  // phones/emails from every text field first (see lib/privacy.ts);
  // the browser overlay still shows the user's original text.
  userPrompt = stripPersonalData(userPrompt);
  businessType = stripPersonalData(businessType);
  businessName = businessName ? stripPersonalData(businessName) : businessName;
  goal = goal ? stripPersonalData(goal) : goal;
  channel = channel ? stripPersonalData(channel) : channel;
  overlayText = overlayText ? stripPersonalData(overlayText) : overlayText;
  const styleText = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.photorealistic;
  const business = businessType ? ` for a ${businessType} business` : "";
  // Name/goal/channel guide the scene only — they are never rendered
  // as text in the image (see the hard rules below).
  const context = [businessName, goal, channel].filter(Boolean).join(", ");
  const main = hasReferences
    ? `Create a new image using the uploaded reference images as the main subjects${business}${context ? ` (${context})` : ""}`
    : `Create a background image${business}${context ? ` (${context})` : ""}`;
  return [
    `${main}: ${userPrompt}.`,
    hasReferences
      ? "Keep the reference subjects recognizable and undistorted — do not change the product itself, only its scene/presentation."
      : "",
    `Style: ${styleText}.`,
    // Text-first flow: the overlay text guides the scene's mood
    // only (celebration for a sale, calm for beauty, etc.). It is
    // NEVER rendered in the image — the browser overlays it later.
    overlayText
      ? `Scene mood from the message that will be overlaid later (do NOT draw these words): ${overlayText}.`
      : "",
    "Hard rules: no text, no letters, no numbers, no logo, no watermark,",
    "no brand name in the image. Leave clean empty space at the top and",
    "centre where a headline will be overlaid later. Do not draw any",
    "person's face in a way that looks like a real identifiable person,",
    "and avoid stereotypes — show ordinary, respectful Myanmar/Thai settings.",
  ].join(" ");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      prompt?: string;
      style?: string;
      format?: string;
      businessType?: string;
      businessName?: string;
      goal?: string;
      channel?: string;
      referenceImages?: string[];
      overlayText?: string;
      authToken?: string;
    };
    const userPrompt = (body.prompt ?? "").trim();
    if (!userPrompt) {
      return NextResponse.json(
        { error: "AI ပုံ ဖန်တီးဖို့ prompt တစ်ခု ရေးပေးပါ။" },
        { status: 400 },
      );
    }
    const provider = imageProvider();
    // Gemini only: GEMINI_API_KEY preferred, AI_API_KEY as fallback
    // (older .env files already hold a Gemini key under that name).
    // "" (not undefined) so later Gemini fetch headers type-check:
    // the gemini branch is only reached when this is non-empty.
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "";
    const envModel = process.env.AI_BACKGROUND_MODEL || "";
    const model = envModel.startsWith("gemini-") ? envModel : "gemini-2.5-flash-image";
    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/openai/images/generations";
    if (provider === "cloudflare") {
      if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
        return NextResponse.json(
          {
            error: "Cloudflare account/token မရှိသေးပါ — .env.local မှာ CLOUDFLARE_ACCOUNT_ID နဲ့ CLOUDFLARE_API_TOKEN ထည့်ပါ။",
            configured: false,
          },
          { status: 503 },
        );
      }
    } else if (!apiKey) {
      return NextResponse.json(
        {
          error: "Gemini key မရှိသေးပါ — .env.local မှာ GEMINI_API_KEY ထည့်ပါ။",
          configured: false,
        },
        { status: 503 },
      );
    }
    const size = SIZES[body.format ?? "1080x1080"] ?? "1024x1024";
    const refs = (body.referenceImages ?? []).slice(0, 3);
    const cost = tokenCost({
      prompt: userPrompt,
      format: body.format ?? "1080x1080",
      referenceCount: refs.length,
    });
    // Logged-in customer: check the server balance BEFORE spending
    // a Gemini call. Guests skip this and use browser tokens.
    const serverUser = await getUserFromToken(body.authToken);
    const service = serverUser ? getServiceSupabase() : null;
    // Admin accounts are unlimited: skip the balance pre-check.
    const isAdmin = serverUser && service ? await isAdminRole(service, serverUser) : false;
    if (serverUser && service && !isAdmin) {
      const balance = await fetchServerBalance(service, serverUser);
      if (balance !== null && balance < cost) {
        return NextResponse.json(
          { error: `Token မလောက်ပါ။ ဒီပုံက ${cost} token ကုန်မယ်၊ ကျန်တာ ${balance} ပဲ ရှိတယ်။` },
          { status: 403 },
        );
      }
    }
    const parsedRefs = refs.map(parseDataUrl);
    if (refs.length > 0 && parsedRefs.some((r) => !r || r.base64.length > 7_000_000)) {
      return NextResponse.json(
        { error: "ပုံ ၃ ပုံအထိ၊ တစ်ပုံ ၅MB အောက်ပဲ ထည့်ပါ။" },
        { status: 400 },
      );
    }
    const prompt = buildPrompt(userPrompt, body.style ?? "photorealistic", body.businessType ?? "", body.businessName, body.goal, body.channel, parsedRefs.length > 0, body.overlayText?.slice(0, 200));

    // Cloudflare Workers AI (free, FLUX.1 schnell, text-to-image only):
    // it cannot edit a reference image, so a request WITH references
    // is rejected with a clear message instead of silently ignoring
    // the reference (e.g. the condo-photo edit case). The REST API
    // returns JSON { result: { image: "<base64>" } }; a binary body
    // is handled too, in case Cloudflare changes the shape.
    if (provider === "cloudflare") {
      if (parsedRefs.length > 0) {
        return NextResponse.json(
          { error: "Cloudflare free model က reference ပုံကို ပြင်လို့ မရဘူး — ပုံကို ဖြုတ်ပြီး စာနဲ့ပဲ ထုတ်ပါ၊ ဒါမှမဟုတ် Gemini (paid) ကို သုံးပါ။" },
          { status: 400 },
        );
      }
      // NOTE (2026-11-01, verified against Cloudflare's live error):
      // flux-1-schnell rejects width/height ("Additional or
      // unevaluated properties '/width, /height' not allowed") — it
      // only accepts prompt (+ steps, which passed validation).
      // So every Cloudflare image comes back square (1024x1024),
      // whatever the ThuKha channel/format is. That is a Cloudflare
      // limitation, not a ThuKha bug; Gemini (paid) is needed for
      // story/cover aspect ratios.
      const cfModel = "@cf/black-forest-labs/flux-1-schnell";
      // cfModel is a fixed constant containing slashes that are part
      // of the API path — encoding them to %2F breaks Cloudflare's
      // routing (verified: a %2F model segment returns 404).
      const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(process.env.CLOUDFLARE_ACCOUNT_ID!)}/ai/run/${cfModel}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);
      let cfRes: Response;
      try {
        cfRes = await fetch(cfUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
          },
          body: JSON.stringify({
            prompt: prompt.slice(0, 2048),
            steps: 4,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!cfRes.ok) {
        return NextResponse.json(
          { error: await cloudflareErrorMessage(cfRes), configured: true },
          { status: 502 },
        );
      }
      let cfImage: string | null = null;
      const contentType = cfRes.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const cfData = (await cfRes.json()) as { result?: { image?: string } };
        cfImage = cfData.result?.image ?? null;
      } else {
        const buf = Buffer.from(await cfRes.arrayBuffer());
        cfImage = buf.length > 0 ? buf.toString("base64") : null;
      }
      if (!cfImage) {
        return NextResponse.json(
          { error: "Cloudflare က ပုံ ပြန်မလာပါ။ ထပ်ကြိုးစားပါ။", configured: true },
          { status: 502 },
        );
      }
      const charge =
        serverUser && service
          ? await chargeServer(service, serverUser, cost, userPrompt, body.format ?? "1080x1080", 0, cfModel, isAdmin)
          : null;
      if (serverUser && service && (!charge || !charge.ok)) {
        return NextResponse.json(
          { error: "Token ဖြတ်လို့ မရပါ။ Token လက်ကျန် စစ်ပြီး ထပ်ကြိုးစားပါ။" },
          { status: 502 },
        );
      }
      return NextResponse.json({
        // Cloudflare's docs say this model's image is JPEG, not PNG.
        imageUrl: `data:image/jpeg;base64,${cfImage}`,
        model: cfModel,
        prompt,
        generated: true,
        cost,
        provider: "cloudflare",
        ...(charge?.unlimited ? { unlimited: true } : charge?.serverBalance !== undefined ? { serverBalance: charge.serverBalance } : {}),
      });
    }

    // Reference images + Gemini: use Gemini's native generateContent
    // path (inlineData parts), because Google's OpenAI-compatible
    // docs do not document an images/edits endpoint.
    if (parsedRefs.length > 0 && apiUrl.includes("generativelanguage.googleapis.com")) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);
      let geminiRes: Response;
      try {
        geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  ...parsedRefs.map((r) => ({
                    inlineData: { mimeType: r!.mime, data: r!.base64 },
                  })),
                  { text: prompt },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["IMAGE"],
              imageConfig: { aspectRatio: ASPECTS[body.format ?? "1080x1080"] ?? "1:1" },
            },
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!geminiRes.ok) {
        return NextResponse.json(
          { error: await geminiErrorMessage(geminiRes), configured: true },
          { status: 502 },
        );
      }
      const geminiData = (await geminiRes.json()) as {
        candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[];
      };
      const part = geminiData.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (!part?.inlineData?.data) {
        return NextResponse.json(
          { error: "AI ပုံ ပြန်မလာပါ။ ထပ်ကြိုးစားပါ။", configured: true },
          { status: 502 },
        );
      }
      const charge =
        serverUser && service
          ? await chargeServer(service, serverUser, cost, userPrompt, body.format ?? "1080x1080", parsedRefs.length, model, isAdmin)
          : null;
      if (serverUser && service && (!charge || !charge.ok)) {
        return NextResponse.json(
          { error: "Token ဖြတ်လို့ မရပါ။ Token လက်ကျန် စစ်ပြီး ထပ်ကြိုးစားပါ။" },
          { status: 502 },
        );
      }
      return NextResponse.json({
        imageUrl: `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}`,
        model,
        prompt,
        generated: true,
        cost,
        ...(charge?.unlimited ? { unlimited: true } : charge?.serverBalance !== undefined ? { serverBalance: charge.serverBalance } : {}),
      });
    }

    // Reference images + OpenAI-compatible provider: /images/edits.
    if (parsedRefs.length > 0) {
      const editsUrl = apiUrl.includes("/images/generations")
        ? apiUrl.replace("/images/generations", "/images/edits")
        : `${apiUrl.replace(/\/$/, "")}/images/edits`;
      const form = new FormData();
      parsedRefs.forEach((r, i) => {
        form.append(
          "image",
          new Blob([Buffer.from(r!.base64, "base64")], { type: r!.mime }),
          `reference-${i}.png`,
        );
      });
      form.append("model", model);
      form.append("prompt", prompt);
      form.append("size", size);
      form.append("response_format", "b64_json");
      form.append("n", "1");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);
      let editsRes: Response;
      try {
        editsRes = await fetch(editsUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: form,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      if (!editsRes.ok) {
        return NextResponse.json(
          { error: "ပုံထည့်ပြီး ထုတ်လို့ မရသေးပါ။ Provider က edits ကို မထောက်ပံ့ရင် ပုံကို ဖြုတ်ပြီး စာနဲ့ပဲ ထုတ်ကြည့်ပါ။", configured: true },
          { status: 502 },
        );
      }
      const editsData = (await editsRes.json()) as {
        data?: { b64_json?: string; url?: string }[];
      };
      const first = editsData.data?.[0];
      const imageUrl = first?.b64_json
        ? `data:image/png;base64,${first.b64_json}`
        : first?.url;
      if (!imageUrl) {
        return NextResponse.json(
          { error: "AI ပုံ ပြန်မလာပါ။ ထပ်ကြိုးစားပါ။", configured: true },
          { status: 502 },
        );
      }
      const charge =
        serverUser && service
          ? await chargeServer(service, serverUser, cost, userPrompt, body.format ?? "1080x1080", parsedRefs.length, model, isAdmin)
          : null;
      if (serverUser && service && (!charge || !charge.ok)) {
        return NextResponse.json(
          { error: "Token ဖြတ်လို့ မရပါ။ Token လက်ကျန် စစ်ပြီး ထပ်ကြိုးစားပါ။" },
          { status: 502 },
        );
      }
      return NextResponse.json({
        imageUrl,
        model,
        prompt,
        generated: true,
        cost,
        ...(charge?.unlimited ? { unlimited: true } : charge?.serverBalance !== undefined ? { serverBalance: charge.serverBalance } : {}),
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let res: Response;
    try {
      res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        // response_format is required for Gemini's OpenAI-compatible
        // endpoint to return b64_json (its example uses it); OpenAI
        // accepts it too, and the code also handles a url response.
        body: JSON.stringify({ model, prompt, size, n: 1, response_format: "b64_json" }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: await geminiErrorMessage(res), configured: true },
        { status: 502 },
      );
    }
    const data = (await res.json()) as {
      data?: { b64_json?: string; url?: string }[];
    };
    const first = data.data?.[0];
    const imageUrl = first?.b64_json
      ? `data:image/png;base64,${first.b64_json}`
      : first?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: "AI ပုံ ပြန်မလာပါ။ ထပ်ကြိုးစားပါ။", configured: true },
        { status: 502 },
      );
    }
    const charge =
      serverUser && service
        ? await chargeServer(service, serverUser, cost, userPrompt, body.format ?? "1080x1080", parsedRefs.length, model, isAdmin)
        : null;
    if (serverUser && service && (!charge || !charge.ok)) {
        return NextResponse.json(
          { error: "Token ဖြတ်လို့ မရပါ။ Token လက်ကျန် စစ်ပြီး ထပ်ကြိုးစားပါ။" },
          { status: 502 },
        );
      }
    return NextResponse.json({
      imageUrl,
      model,
      prompt,
      generated: true,
      cost,
      ...(charge?.unlimited ? { unlimited: true } : charge?.serverBalance !== undefined ? { serverBalance: charge.serverBalance } : {}),
    });
  } catch {
    return NextResponse.json(
      { error: "AI ပုံ ထုတ်လို့ မရသေးပါ။ ထပ်ကြိုးစားပါ။" },
      { status: 500 },
    );
  }
}

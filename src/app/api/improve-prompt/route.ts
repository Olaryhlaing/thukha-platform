import { NextResponse } from "next/server";
import { stripPersonalData } from "@/lib/privacy";

/* Prompt Assistant — professional, not just longer.
   Template version, no AI key needed: it turns the customer's
   rough idea into 3 distinct professional image prompts, each
   a complete advertising brief (subject + setting + light +
   composition + mood), not the same base with 3 adjective
   swaps. The idea itself is kept verbatim, so a Burmese idea
   is not mistranslated — professional English descriptors are
   wrapped around it, because image models understand those
   best. If a real text model is wired later, keep this same
   response shape: {options: string[]}.

   Professional structure (2026-11-02, user request: make
   suggestions the best and most professional):
   - Hero Studio: clean, centred, studio light — best for a
     product/menu card that must read instantly.
   - Lifestyle Scene: real everyday Myanmar/Thai setting,
     natural light, warm and trustworthy — best for brand
     trust and social feeds.
   - Premium Editorial: dramatic soft light, elegant
     composition with empty space for a headline — best for
     a launch or promotion that must look high-end.
   Each option is also tailored by business type (food,
   product, beauty, service, agency), by goal (sales, brand,
   promotion) and by channel (square post, vertical story,
   wide cover) — the channel the customer already chose in
   /create, so the composition matches where the image will
   actually be posted.

   Mode-aware (2026-11-02, AI-text mode): when the customer
   lets AI write the text in the image (renderText), the
   suggestions must NOT say "no text" — that would contradict
   the server's render instruction and confuse the model.
   They say "no logo, no watermark" only. In Overlay mode
   they keep "no text, no logo, no watermark" plus empty
   space for the headline, because the browser overlays the
   text later with 100% correct Burmese.

   Privacy: personal data is stripped from every field before
   it is echoed into a suggestion, so a phone/email in the
   idea can never reach an image provider through the prompt
   box (the generate route strips again, as a second layer). */

function businessDescriptor(type: string): string {
  if (type.includes("စားသောက်ဆိုင်")) {
    return "freshly prepared food, steam rising, vibrant natural ingredients, warm restaurant table setting";
  }
  if (type.includes("Online shop") || type.toLowerCase().includes("shop")) {
    return "product presented clearly, clean background, sharp product detail";
  }
  if (type.includes("အလှအပ")) {
    return "elegant beauty setting, soft diffused light, clean and fresh atmosphere, premium care products";
  }
  if (type.includes("ဝန်ဆောင်မှု")) {
    return "professional service in action, friendly and trustworthy, clean modern setting, real-life context";
  }
  if (type.includes("Agency")) {
    return "modern creative workspace, sleek contemporary design, professional and confident atmosphere";
  }
  return "clear subject, clean professional setting, attractive presentation";
}

function goalMood(goal: string): string {
  if (goal.includes("ရောင်း")) {
    return "appetizing and enticing, eye-catching, made to encourage customers to buy";
  }
  if (goal.includes("Brand")) {
    return "memorable and clean, consistent brand-style presentation that customers will recognise";
  }
  if (goal.includes("Promotion")) {
    return "festive and exciting, celebratory mood, vibrant colours that announce a special offer";
  }
  return "attractive and professional, made to stop the scroll on Facebook";
}

function channelComposition(channel: string): string {
  if (channel.includes("story") || channel.includes("Story")) {
    return "vertical composition, subject in the upper two-thirds, clean space below for a headline";
  }
  if (channel.includes("cover") || channel.includes("Cover")) {
    return "wide banner composition, subject to one side, clean empty space for a headline";
  }
  return "square composition, subject centred and balanced, with clean empty space at the top for a headline";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idea?: string;
      overlayText?: string;
      businessType?: string;
      businessName?: string;
      goal?: string;
      channel?: string;
      renderText?: boolean;
    };
    const idea = stripPersonalData((body.idea ?? "").trim().replace(/[.。]+$/, ""));
    const overlay = stripPersonalData((body.overlayText ?? "").trim());
    if (!idea && !overlay) {
      return NextResponse.json(
        { error: "အပေါ်မှာ စာ (ခေါင်းစဉ်) ဒါမှမဟုတ် prompt အကြမ်း တစ်ခု အရင် ရေးပေးပါ။" },
        { status: 400 },
      );
    }
    const businessType = stripPersonalData(body.businessType ?? "");
    const goal = stripPersonalData(body.goal ?? "");
    const channel = stripPersonalData(body.channel ?? "");
    // When there is an idea, the overlay text shapes its mood;
    // when there is only overlay text, it becomes the topic.
    const base = idea || `A scene matching the message "${overlay}"`;
    const mood = idea && overlay ? `, matching the message "${overlay}"` : "";
    const descriptor = businessDescriptor(businessType);
    const goalText = goalMood(goal);
    const composition = channelComposition(channel);
    const tail = body.renderText === true
      ? "no logo, no watermark"
      : "no text, no logo, no watermark, with clean empty space for a headline";
    const options = [
      // 1. Hero Studio — clean, instant, product-first.
      `Professional studio advertising photograph of ${base}${mood}: ${descriptor}, ${composition}, soft studio lighting, sharp focus, high detail, premium commercial quality, ${tail}`,
      // 2. Lifestyle Scene — real, warm, trustworthy.
      `Authentic lifestyle photograph of ${base}${mood}: ${descriptor}, natural light, real everyday Myanmar setting, warm and inviting atmosphere, candid and trustworthy, ${goalText}, professional photography, ${tail}`,
      // 3. Premium Editorial — high-end, headline-ready.
      `Premium editorial advertising image of ${base}${mood}: ${descriptor}, dramatic soft lighting, ${composition}, rich natural colours, high-end commercial quality, ${goalText}, ${tail}`,
    ];
    return NextResponse.json({ options, template: true });
  } catch {
    return NextResponse.json(
      { error: "Prompt suggestions ထုတ်လို့ မရသေးပါ။" },
      { status: 500 },
    );
  }
}

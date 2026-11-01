import { NextResponse } from "next/server";

/* Prompt Assistant — Walone-like, but honest about what it is.
   Template version, no AI key needed: it expands the customer's
   rough idea into 3 fuller image prompts (photorealistic, warm
   scene, clean promo). The idea itself is kept verbatim, so a
   Burmese idea is not mistranslated. If a real text model is
   wired later, keep this same response shape: {options: string[]}.

   Text-first (2026-11-01): suggestions are based on the text
   typed ABOVE (section 1 overlay headline/subheadline) as well
   as the prompt box. If the prompt box is empty but overlay text
   exists, suggestions are built from the overlay text alone, so
   the customer can start from the message, not from a prompt. The
   overlay words are scene mood only — they are never rendered
   as text in the image (every option ends with no text/no logo). */

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idea?: string;
      overlayText?: string;
      businessType?: string;
      businessName?: string;
      goal?: string;
      channel?: string;
    };
    const idea = (body.idea ?? "").trim().replace(/[.。]+$/, "");
    const overlay = (body.overlayText ?? "").trim();
    if (!idea && !overlay) {
      return NextResponse.json(
        { error: "အပေါ်မှာ စာ (ခေါင်းစဉ်) ဒါမှမဟုတ် prompt အကြမ်း တစ်ခု အရင် ရေးပေးပါ။" },
        { status: 400 },
      );
    }
    const context = [body.businessName, body.businessType, body.goal]
      .filter(Boolean)
      .join(", ");
    const ctx = context ? `, for ${context}` : "";
    // When there is an idea, the overlay text shapes its mood;
    // when there is only overlay text, it becomes the topic.
    const base = idea || `A scene matching the message "${overlay}"`;
    const overlayCtx = idea && overlay ? `, matching the message "${overlay}" (scene mood only, do not draw these words)` : "";
    const options = [
      `${base}${ctx}${overlayCtx}, photorealistic, natural light, high detail, professional photography, no text, no logo, no watermark`,
      `${base}${ctx}${overlayCtx}, warm inviting atmosphere, soft natural light, attractive presentation, centred subject, clean background, no text, no logo`,
      `${base}${ctx}${overlayCtx}, clean minimal composition, bright studio light, subject centred, lots of empty space, professional promo photo, no text, no watermark`,
    ];
    return NextResponse.json({ options, template: true });
  } catch {
    return NextResponse.json(
      { error: "Prompt suggestions ထုတ်လို့ မရသေးပါ။" },
      { status: 500 },
    );
  }
}

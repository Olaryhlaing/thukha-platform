import { NextResponse } from "next/server";

/* Dev 1 QA contract (DEV1-DETAILED-GUIDE.md §7).
   Warnings only — QA never blocks export. */

function numbers(text: string): string[] {
  return text.match(/[\d,]+/g) ?? [];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      headline?: string;
      caption?: string;
      price?: string;
    };
    const headline = body.headline ?? "";
    const caption = body.caption ?? "";
    const price = body.price ?? "";
    const warnings: { code: string; message: string }[] = [];

    if (price) {
      const priceNums = numbers(price);
      const inText = numbers(`${headline} ${caption}`);
      if (priceNums.length > 0 && !priceNums.some((n) => inText.includes(n))) {
        warnings.push({
          code: "price_mismatch",
          message: "ဈေးနှုန်း field နဲ့ headline/caption ထဲက ဈေး မတူပါ — ပြန်စစ်ပါ။",
        });
      }
    }
    if (!headline.trim()) {
      warnings.push({
        code: "empty_headline",
        message: "Headline မရှိသေးပါ။",
      });
    }

    return NextResponse.json({ warnings, passed: warnings.length === 0 });
  } catch {
    return NextResponse.json(
      { error: "QA စစ်လို့ မရသေးပါ။" },
      { status: 500 },
    );
  }
}

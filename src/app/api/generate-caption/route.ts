import { NextResponse } from "next/server";

/* Dev 1 API contract (DEV1-DETAILED-GUIDE.md §6).
   Template version for the prototype: no AI key is used here.
   When AI_TEXT_MODEL is configured, replace the template body with a
   server-only model call — keep the same response shape. */

type BriefInput = {
  businessName?: string;
  product?: string;
  target?: string;
  goal?: string;
  channel?: string;
  headline?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      brief?: BriefInput;
      tone?: string;
    };
    const brief = body.brief ?? {};
    const name = brief.businessName || "သင့်လုပ်ငန်း";
    const product = brief.product || "product";
    const target = brief.target ? ` ${brief.target} အတွက်` : "";
    const headline = brief.headline || "သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ်";
    const tone = body.tone ?? "friendly";

    const options = [
      `${name} မှ ${product}${target} — ${headline}`,
      `${product} ကြိုက်သူတွေအတွက် ${name} က အသင့်ရှိနေပါပြီ။ အခုပဲ မှာယူပါ။`,
      `${name} — ${headline} (${tone === "discount" ? "အထူးလျှော့ဈေးနဲ့" : tone === "premium" ? "အရည်အသွေးမြင့် ရွေးချယ်မှု" : "စျေးသင့်ပြီး အရသာရှိ"})`,
    ];

    return NextResponse.json({
      options,
      thai: "",
      hashtags: ["#ThuKha", "#MyanmarBusiness"],
      template: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Caption ထုတ်လို့ မရသေးပါ။ ထပ်ကြိုးစားပါ။" },
      { status: 500 },
    );
  }
}

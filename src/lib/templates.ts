/* Shared template data: /create prefills from them via
   ?template=<id>. The prompt is a starting idea the customer can
   edit — it is never rendered as text in the image. (The old
   /templates browsing page was removed on 2026-11-01.) */
export type Template = {
  id: string;
  type: string;
  name: string;
  headline: string;
  product: string;
  target: string;
  format: string;
  businessType: string;
  channel: string;
  prompt: string;
};

export const TEMPLATES: Template[] = [
  {
    id: "mohinga",
    type: "စားသောက်ဆိုင်",
    name: "မုန့်ဟင်းခါး Promotion",
    headline: "မနက်ခင်း အရသာ — မုန့်ဟင်းခါး",
    product: "မုန့်ဟင်းခါး",
    target: "Bangkok ရှိ မြန်မာမိသားစုများ",
    format: "1080 × 1080",
    businessType: "စားသောက်ဆိုင်",
    channel: "Facebook post",
    prompt: "မုန့်ဟင်းခါးကို လှပစွာ တင်ထားတဲ့ စားပွဲ၊ warm light",
  },
  {
    id: "fashion",
    type: "Online shop",
    name: "အထည် New Collection",
    headline: "New Collection ရောက်ပြီ",
    product: "မြန်မာအထည်",
    target: "Online ဝယ်သူများ",
    format: "1080 × 1920 (Story)",
    businessType: "Online shop",
    channel: "Story",
    prompt: "မြန်မာအထည်အသစ်တွေကို လှပစွာ ပြထားတဲ့ ဆိုင်၊ bright light",
  },
  {
    id: "salon",
    type: "အလှအပ / ဝန်ဆောင်မှု",
    name: "Salon Promotion",
    headline: "လှပဖို့ အချိန်တန်ပြီ",
    product: "Salon service",
    target: "မြို့နေ အမျိုးသမီးများ",
    format: "1080 × 1080",
    businessType: "အလှအပ",
    channel: "Facebook post",
    prompt: "သန့်ရှင်းလှပတဲ့ salon အတွင်း၊ soft light, elegant",
  },
];

# Fix — Resolved Ticket Lock + Notification Deep-Link (2026-11-06)

ပြင်ထားတာ ၂ ခု။ Lint 0 errors, Build success (local commit `b6b7f6c`)။
Database ပြင်စရာ မရှိဘူး — Code ပဲ။

## ၁။ ဖြေရှင်းပြီးတဲ့ Ticket ကို ထပ်ဖြေလို့ မရတော့ဘူး

- **Admin စာမျက်နှာ (/admin):** Status "ဖြေရှင်းပြီးပြီ" ဖြစ်တဲ့ Ticket မှာ
  အဖြေရေးတဲ့ Box + "အဖြေပို့ပြီး သိမ်းပါ" + "ဖြေရှင်းပြီးပြီလို့ မှတ်ပါ" ခလုတ်
  သုံးခုလုံး ပိတ်သွားမယ် (မှိန်သွားမယ်)၊ အစား "✓ ဖြေရှင်းပြီးပြီ — ထပ်ဖြေလို့
  မရတော့ပါ။" ဆိုတဲ့ စာ ပေါ်မယ်။
- **Server ဘက်ကလည်း ပိတ်ထားတယ်:** ဖြေရှင်းပြီးတဲ့ Ticket ကို API ကနေ
  ပြင်ဖို့ ကြိုးစားရင် Error ပြန်မယ် ("ဒီ Ticket ကို ဖြေရှင်းပြီးပြီ —
  ထပ်ဖြေလို့ မရပါ။") — စာမျက်နှာ အဟောင်း ဖွင့်ထားရင်တောင် ထပ်ဖြေလို့ မရဘူး။
- မှတ်ချက်: ဖြေရှင်းပြီးရင် **ပြန်ဖွင့်လို့ မရဘူး** (Reopen ခလုတ် မရှိသေးဘူး)။
  မှားပြီး ဖြေရှင်းပြီးလို့ မှတ်မိရင် Customer က Ticket အသစ် ထပ်တင်ရမယ်။
  Reopen လိုချင်ရင် ပြောပါ — ထည့်ပေးမယ်။

## ၂။ Notification နှိပ်ရင် ဖြေတဲ့နေရာကို တန်းသွားမယ်

- **Admin:** Customer က Ticket တင်လို့ Notification ရရင် နှိပ်လိုက်ရင်
  /admin အပေါ်ဆုံး မဟုတ်တော့ဘူး — **Customer Service Section ဆီ တန်း
  ရောက်မယ်** (Ticket အဖြေရေးတဲ့နေရာ)။
- **Customer:** Admin အဖြေပေး/ဖြေရှင်းပြီးလို့ Notification ရရင် နှိပ်လိုက်ရင်
  /support က **ကိုယ့် Ticket စာရင်း ဆီ တန်း ရောက်မယ်**။
- မှတ်ချက်: ဒီပြင်ဆင်မှု မတိုင်ခင် ရောက်ပြီးသား Notification အဟောင်းတွေက
  Link အဟောင်း (/admin, /support) အတိုင်း ဖြစ်နေမယ် — အသစ် ရောက်လာတဲ့
  Notification တွေကသာ နေရာအတိအကျကို သွားမယ်။

## Copy-in အဆင့်

Pack ထဲက ဖိုင် ၅ ခု ကို `D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း
ကူးထည့်ပါ (ဖိုင်အဟောင်းကို အစားထိုးပါ) → Commit → Push → Vercel Ready →
Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

1. Admin က Ticket တစ်ခု ကို "ဖြေရှင်းပြီးပြီလို့ မှတ်ပါ" နှိပ် → အဲဒီ
   Ticket ရဲ့ အဖြေ Box နဲ့ ခလုတ် ၂ ခု ပိတ်သွားရမယ် + "ဖြေရှင်းပြီးပြီ —
   ထပ်ဖြေလို့ မရတော့ပါ။" စာ ပေါ်ရမယ်။
2. Customer Account နဲ့ Ticket အသစ် တင် → Admin 🔔 နှိပ် → /admin က
   Customer Service Section ဆီ တန်း ရောက်ရမယ်။
3. Admin က Ticket ကို အဖြေပေး → Customer 🔔 နှိပ် → /support က ကိုယ့်
   Ticket စာရင်း ဆီ တန်း ရောက်ရမယ်။

## ဖိုင်စာရင်း (၅ ဖိုင်)

- `src/app/api/admin/support/route.ts` — ဖြေရှင်းပြီးတဲ့ Ticket ကို Server က ပိတ်တယ် + Notify Link `/support#tickets`
- `src/app/api/support/route.ts` — Ticket အသစ် Notify Link `/admin#support`
- `src/app/admin/page.tsx` — Support Section `id="support"` + ဖြေရှင်းပြီးရင် Box/ခလုတ် Disable + စာ
- `src/app/support/page.tsx` — ကိုယ့် Ticket စာရင်း `id="tickets"`
- `src/lib/i18n.ts` — `support.adminResolvedLocked` Key (မြန်မာ + အင်္ဂလိပ်)

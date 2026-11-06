# Customer Service — ThuKha Platform (2026-11-06)

Customer တွေ အကူအညီတောင်းလို့ရမယ့် Customer Service — /support စာမျက်နှာ
(FAQ + Ticket) နဲ့ Admin Inbox။ Lint 0 errors, Build success (local commit `3f2bf7f`)။

## ဘာပါလဲ

- **/support (Customer)** — Header မှာ "အကူအညီ" Link အသစ်။ Login မလုပ်လည်း FAQ ဖတ်လို့ရတယ်။
  - FAQ ၆ ခု: Token ကုန်တာ / မြန်မာစာပျက်တာ / ပုံထုတ်မရတာ / Download မရတာ / Account ပိတ်ခံရတာ / ငွေပေးချေမှု (မရှိသေးဘူး ဆိုတာ အမှန်အတိုင်း ရေးထားတယ်)။
  - Ticket တင်တာ: အမျိုးအစား (Token / ပုံထုတ်တာ / Download / Account / ငွေပေးချေမှု / အခြား) + ခေါင်းစဉ် (200) + အကြောင်း (2000)။ **Login လုပ်ထားမှ တင်လို့ရတယ်** — Ticket က Account နဲ့ ချိတ်ထားရမယ်၊ Guest တင်လို့ မရဘူး။
  - ကိုယ့် Ticket များ: Status (စောင့်နေတယ် / ကြည့်နေပါတယ် / ဖြေရှင်းပြီးပြီ) + Admin အဖြေ ကို ဒီစာမျက်နှာမှာပဲ ပြတယ်။
- **Admin Inbox (/admin)** — "Customer Service (Ticket များ)" Section အသစ်: Ticket အားလုံး (အသစ်ဆုံး အရင်) + ပိုင်ရှင်နာမည် + အမျိုးအစား + အဖြေရေးတဲ့ Box + "အဖြေပို့ပြီး သိမ်းပါ" (Status → ကြည့်နေပါတယ်) / "ဖြေရှင်းပြီးပြီလို့ မှတ်ပါ" ခလုတ်များ။
- **Audit Log** — Admin အဖြေပေးတာ (`support_reply`) နဲ့ Status ပြောင်းတာ (`support_status`) ကို Audit Log မှာ မှတ်တယ်။

## ⚠️ Supabase အဆင့် — အရင် လုပ်ပါ (Batch 2 လိုပဲ)

Pack ထဲက `supabase/schema.sql` **အပြည့်အစုံ** ကို Supabase Dashboard → SQL Editor မှာ Paste → Run လုပ်ပါ။ အသစ်က `support_tickets` Table တစ်ခု ပဲ (တခြားဟာ အကုန် "ရှိရင် မထည့်ဘူး" migration တွေ၊ ပြန် Run လို့ လုံခြုံတယ်)။ ဒီအဆင့် မလုပ်ရင် Ticket ပို့တာ/ဖတ်တာ `Ticket ပို့၍ မရပါ` Error ဖြစ်မယ်။ Table အရေအတွက် အခု **10** ခု ဖြစ်သွားပြီ။

## Copy-in အဆင့်

1. Supabase schema အရင် Run (အပေါ်က အဆင့်)။
2. Pack ထဲက ဖိုင် ၇ ခု ကို `D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း ကူးထည့်ပါ (ဖိုင်အဟောင်းကို အစားထိုးပါ — `src/lib/i18n.ts`, `src/app/admin/page.tsx`, `src/components/SiteHeader.tsx` က အဟောင်းကို အစားထိုးရမယ့် ဖိုင်အပြည့်ပါ)။
3. Commit → Push → Vercel Ready → Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

- **Customer:** Login လုပ်ပြီး /support သွား → FAQ ဖတ်ကြည့် → Ticket တစ်ခု တင် (ဥပမာ Token အမျိုးအစား) → "Ticket ပို့ပြီးပြီ" ပေါ်ပြီး ကိုယ့် Ticket စာရင်းမှာ Status "စောင့်နေတယ်" နဲ့ ပေါ်ရမယ်။
- **Guest:** Logout လုပ်ပြီး /support သွား → FAQ မြင်ရမယ်၊ Ticket Form အစား "Login အရင် လုပ်ပါ" ပေါ်ရမယ်။
- **Admin:** /admin သွား → Customer Service Section မှာ အဲဒီ Ticket ပေါ်ရမယ် → အဖြေရေးပြီး "အဖြေပို့ပြီး သိမ်းပါ" နှိပ် → Status "ကြည့်နေပါတယ်" ဖြစ်ပြီး Audit Log မှာ `support_reply` ပေါ်ရမယ် → Customer /support မှာ Admin အဖြေ မြင်ရမယ် → Admin "ဖြေရှင်းပြီးပြီလို့ မှတ်ပါ" နှိပ်ရင် Status "ဖြေရှင်းပြီးပြီ" ဖြစ်မယ်။

## ကန့်သတ်ချက် (အမှန်အတိုင်း)

- **Live Chat မဟုတ်ဘူး** — Ticket + အဖြေပဲ၊ အချိန်နဲ့တပြေး စကားပြောတာ မဟုတ်ဘူး။
- **Email Notification မရှိဘူး** — Admin အဖြေပေးရင် Customer ကို Email မပို့ဘူး၊ Customer က /support မှာ ကိုယ်တိုင် လာကြည့်ရမယ်။ (Email ပို့ချင်ရင် နောက် အဆင့်မှာ Supabase Email / သီးသန့် Service လိုမယ်။)
- Ticket တစ်ခု အတွက် စကားဝိုင်း (နောက်ထပ် အပြန်အလှန် စာပို့တာ) မရှိသေးဘူး — Customer က အသစ် Ticket ထပ်တင်ရမယ်။
- Admin အဖြေက ဗလာ ဖြစ်နေရင် Status ပဲ ပြောင်းမယ် — အဖြေ ရေးဖို့ မမေ့ပါနဲ့။

## ဖိုင်စာရင်း (၇ ဖိုင်)

- `supabase/schema.sql` — `support_tickets` Table + RLS enable (API-only, browser policy မရှိ)
- `src/app/api/support/route.ts` — GET ကိုယ့် Ticket, POST Ticket အသစ်
- `src/app/api/admin/support/route.ts` — GET Ticket အားလုံး, PATCH အဖြေ + Status
- `src/app/support/page.tsx` — FAQ + Ticket Form + ကိုယ့် Ticket စာရင်း
- `src/app/admin/page.tsx` — Support Tickets Section
- `src/components/SiteHeader.tsx` — "အကူအညီ" Nav Link
- `src/lib/i18n.ts` — `nav.support` + `support.*` Key များ (မြန်မာ + အင်္ဂလိပ်)

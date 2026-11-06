# Notifications — Admin + Customer (In-App Bell) (2026-11-06)

Header မှာ 🔔 ခေါင်းလောင်း + မဖတ်ရသေး အရေအတွက် Badge ပါမယ်။
နှိပ်ရင် အကြောင်းကြားစာ စာရင်း ပေါ်မယ်၊ တစ်ခုနှိပ်ရင် ဖတ်ပြီးလို့ မှတ်ပြီး
သက်ဆိုင်ရာ စာမျက်နှာကို သွားမယ်။ **In-app ပဲ** — Email မပို့ဘူး၊ ဖုန်း Push
Notification မဟုတ်ဘူး (အဲဒါလုပ်ချင်ရင် Push Subscription စနစ် သီးသန့် လိုမယ်)။
Lint 0 errors, Build success (local commits `9f89fcb` + `e2ec8f6`)။

## ဘယ်အချိန် Notification ရမလဲ

**Customer ရမှာ:**
- Admin က Ticket ကို အဖြေပေးရင် → "/support ကို သွား" (Ticket ခေါင်းစဉ် ပါတယ်)
- Admin က Ticket ကို ဖြေရှင်းပြီးပြီလို့ မှတ်ရင် → /support
- Admin က Token ဖြည့်ပေးရင် → /account (ပမာဏ ပါတယ်)
- Admin က Account ပိတ်ရင် / ပြန်ဖွင့်ပေးရင် → /account
- Admin က Announcement အသစ် တင်ရင် → /create (Customer အားလုံးကို ရမယ်)

**Admin ရမှာ:**
- Customer က Ticket အသစ် တင်ရင် → /admin (Ticket ခေါင်းစဉ် ပါတယ်)
- အသုံးပြုသူ အသစ် အကောင့်ဖွင့်ရင် (ပထမဆုံး Login မှာ) → /admin

Bell က ၆၀ စက္ကန့် တစ်ခါ + Tab ပြန်လာတိုင်း အသစ် စစ်တယ်။ မဖတ်ရသေး
အရေအတွက်က Badge မှာ ပေါ်မယ်၊ "အားလုံး ဖတ်ပြီးလို့ မှတ်ပါ" ခလုတ်လည်း ပါတယ်။

## ⚠️ Supabase အဆင့် — အရင် လုပ်ပါ

Pack ထဲက `supabase/schema.sql` **အပြည့်အစုံ** ကို SQL Editor မှာ Paste → Run လုပ်ပါ။
အသစ်က `notifications` Table တစ်ခု ပဲ (တခြား အကုန် "ရှိရင် မထည့်ဘူး" migration တွေ၊
ပြန် Run လို့ လုံခြုံတယ် — Batch 2 + Customer Service အတွက် ပြင်ထားတဲ့
`drop policy "active announcements read"` လိုင်းလည်း ပါပြီးသား)။
ဒီအဆင့် မလုပ်ရင် Bell က အကြောင်းကြားစာ ဖတ်လို့ မရဘူး။ Table အရေအတွက် အခု **11** ခု။

## Copy-in အဆင့်

1. Supabase schema အရင် Run (အပေါ်က အဆင့်)။
2. Pack ထဲက ဖိုင် ၁၃ ခု ကို `D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း ကူးထည့်ပါ
   (ဖိုင်အဟောင်းကို အစားထိုးပါ — `src/lib/i18n.ts`, `src/components/SiteHeader.tsx`,
   `src/app/api/support/route.ts` တို့က ဖိုင်အပြည့်ပါ)။
3. Commit → Push → Vercel Ready → Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

- **Customer → Admin:** Customer Account နဲ့ Login → /support မှာ Ticket တစ်ခု တင် →
  Admin Account နဲ့ ဝင်ကြည့် → Header 🔔 မှာ Badge **1** ပေါ်ရမယ် → နှိပ်ရင်
  "Ticket အသစ်" ပေါ်ရမယ် → နှိပ်ရင် /admin က Inbox ဆီ သွားရမယ်။
- **Admin → Customer:** Admin က အဲဒီ Ticket ကို အဖြေပေးပြီး သိမ်းပါ →
  Customer Account နဲ့ ဝင်ကြည့် → 🔔 Badge ပေါ်ပြီး "အက်ဒမင်က Ticket ကို
  အဖြေပေးပြီ" ပေါ်ရမယ် → နှိပ်ရင် /support ဆီ သွားရမယ်။
- **Token:** Admin က Customer ကို Token ဖြည့်ပေးရင် Customer ဆီမှာ
  "Token ဖြည့်ပေးပြီ" Notification ရမယ်။
- **Announcement:** Admin က Announcement အသစ် တင်ရင် Customer အားလုံး ဆီမှာ
  "ကြေညာချက် အသစ်" Notification ရမယ်။
- **အသစ် User:** အကောင့်အသစ် ဖွင့်ပြီး ပထမဆုံး Login လုပ်ရင် Admin ဆီမှာ
  "အသုံးပြုသူ အသစ်" Notification ရမယ်။
- **ဖတ်ပြီးမှတ်တာ:** Notification တစ်ခုနှိပ်ရင် Badge အရေအတွက် လျော့ရမယ်၊
  "အားလုံး ဖတ်ပြီးလို့ မှတ်ပါ" နှိပ်ရင် Badge ပျောက်ရမယ်။

## ကန့်သတ်ချက် (အမှန်အတိုင်း)

- In-app ပဲ — Browser ပိတ်ထားရင် / App မဖွင့်ထားရင် Notification မရောက်ဘူး။
  ဖုန်း Push လိုချင်ရင် နောက် အဆင့်မှာ Push Subscription + VAPID Key စနစ် လိုမယ်။
- Notification ကို ဖျက်လို့ မရဘူး (ဖတ်ပြီးလို့ပဲ မှတ်လို့ရတယ်) — စာရင်းက
  နောက်ဆုံး ၅၀ ခုပဲ ပြတယ်။

## ဖိုင်စာရင်း (၁၃ ဖိုင်)

- `supabase/schema.sql` — `notifications` Table + RLS enable (API-only)
- `src/lib/notify.ts` — အသစ် (notifyUser / notifyAdmins / notifyCustomers, best-effort)
- `src/app/api/notifications/route.ts` — အသစ် (GET ကိုယ့် Notification + unread, PATCH ဖတ်ပြီးမှတ်)
- `src/components/NotificationBell.tsx` — အသစ် (🔔 + Badge + Dropdown)
- `src/components/SiteHeader.tsx` — Bell ကို Header ညာဘက် (Toggle တွေရှေ့) ထည့်တယ်
- `src/lib/i18n.ts` — `notif.*` Key များ (မြန်မာ + အင်္ဂလိပ်)
- `src/app/api/support/route.ts` — Ticket အသစ် → Admin တွေကို Notify
- `src/app/api/admin/support/route.ts` — အဖြေ/ဖြေရှင်းပြီး → Ticket ပိုင်ရှင်ကို Notify
- `src/app/api/admin/tokens/route.ts` — Token ဖြည့် → Customer ကို Notify
- `src/app/api/admin/suspend/route.ts` — ပိတ်/ပြန်ဖွင့် → Customer ကို Notify
- `src/app/api/admin/announcements/route.ts` — Announcement အသစ် → Customer အားလုံးကို Notify
- `src/app/api/me/route.ts` — အသုံးပြုသူ အသစ် (ပထမ Login) → Admin တွေကို Notify

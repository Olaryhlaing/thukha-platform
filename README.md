# Admin Support Inbox — စာမျက်နှာ အသစ် `/admin/support` (2026-11-06)

Customer က အကူအညီ ပို့လာရင် Admin က တိုက်ရိုက်ဖြေလို့ရမယ့် စာမျက်နှာ
အသစ် လုပ်ပေးထားတယ်။ ပြီးတော့ အဖြေတဲ့အပိုင်းကို Admin Dashboard (/admin)
ကနေ ဖြုတ်လိုက်ပြီ။ Lint 0 errors, Build success (local commit `3c84016`)။
Database ပြင်စရာ မရှိဘူး။

## ဘာတွေ ပြောင်းလဲ?

- **စာမျက်နှာ အသစ် `/admin/support`:** Admin ပဲ ဝင်လို့ရတယ် (Customer/
  Guest ဝင်ရင် /create ကို ပြန်ပို့မယ်)။ Ticket အားလုံး စာရင်းနဲ့ ပေါ်မယ် —
  ခေါင်းစဉ်၊ Status (စောင့်နေတယ် / ဖြေနေတယ် / ဖြေရှင်းပြီးပြီ), Category,
  Customer နာမည်၊ ရက်စွဲ၊ Message၊ အရင် အဖြေ။ အပေါ်မှာ "မဖြေရသေး Ticket
  X ခု" ဆိုတဲ့ အရေအတွက် ပါတယ်။ Ticket တစ်ခုချင်းစီမှာ အဖြေရေးတဲ့ Box +
  "အဖြေပို့ပြီး သိမ်းပါ" + "ဖြေရှင်းပြီးပြီလို့ မှတ်ပါ" ခလုတ် ပါတယ်။
  ဖြေရှင်းပြီးတဲ့ Ticket က အရင်အတိုင်း Lock ဖြစ်တယ် (ထပ်ဖြေလို့ မရဘူး)။
- **Admin Dashboard (/admin):** Ticket ဖြေတဲ့အပိုင်း အပြည့်အဝ ဖြုတ်လိုက်ပြီ
  (Stats, Users, Health, Audit Log, Announcements ပဲ ကျန်တယ်)။ Dashboard
  အပေါ်မှာ "💬 ဖောက်သည် ဝန်ဆောင်မှု (Ticket များ) →" ခလုတ် ပါတယ် —
  နှိပ်ရင် /admin/support ကို သွားမယ်။
- **Notification Link ပြောင်းတယ်:** Customer Ticket တင်လို့ Admin
  Notification ရရင် နှိပ်လိုက်ရင် /admin/support (Inbox) ဆီ တန်း သွားမယ်။
- **/support:** Admin က /support ကို တိုက်ရိုက် ဝင်ရင် /admin/support ကို
  ပြန်ပို့မယ် (အရင်က /admin ကို ပို့တာ)။ Customer ဘက် မပြောင်းလဲဘူး။

## Copy-in အဆင့်

Pack ထဲက ဖိုင် ၅ ခု ကို `D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း
ကူးထည့်ပါ (ဖိုင်အဟောင်းကို အစားထိုးပါ) → Commit → Push → Vercel Ready →
Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

1. **Admin Account နဲ့ Login** → /admin မှာ Ticket ဖြေတဲ့အပိုင်း မရှိတော့ဘူး၊
   အပေါ်မှာ "💬 ဖောက်သည် ဝန်ဆောင်မှု (Ticket များ) →" ခလုတ် ရှိရမယ် →
   နှိပ်ရင် /admin/support ပွင့်ပြီး Ticket စာရင်း ပေါ်ရမယ်။
2. Ticket တစ်ခုမှာ အဖြေရေးပြီး "အဖြေပို့ပြီး သိမ်းပါ" နှိပ် → "သိမ်းပြီးပြီ"
   ပေါ်ပြီး Customer ဆီမှာ Notification ရောက်ရမယ်။
3. "ဖြေရှင်းပြီးပြီလို့ မှတ်ပါ" နှိပ်ရင် အဲဒီ Ticket Lock ဖြစ်သွားရမယ်။
4. **Customer Account နဲ့ /admin/support ရိုက်ဝင်** → /create ကို ပြန်ရောက်ရမယ်။
5. **Customer က Ticket အသစ် တင်** → Admin 🔔 နှိပ်ရင် /admin/support ဆီ
   တန်း ရောက်ရမယ်။

## ဖိုင်စာရင်း (၅ ဖိုင်)

- `src/app/admin/support/page.tsx` — အသစ် (Admin Support Inbox စာမျက်နှာ)
- `src/app/admin/page.tsx` — Ticket အပိုင်း ဖြုတ် + /admin/support ခလုတ် ထည့်
- `src/app/api/support/route.ts` — Ticket အသစ် Notify Link `/admin/support`
- `src/app/support/page.tsx` — Admin redirect + Inbox Link `/admin/support`
- `src/lib/i18n.ts` — `support.backToAdmin`, `support.adminOpenCount` Key အသစ် (မြန်မာ + အင်္ဂလိပ်)

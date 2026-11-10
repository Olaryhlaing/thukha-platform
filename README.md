# Audit Log — Tab အသစ် `/admin/audit` (2026-11-10)

Audit log ကို Admin Dashboard ထဲက အပိုင်း အဖြစ် မထားတော့ဘဲ Header Nav
မှာ Tab တစ်ခု အနေနဲ့ ခွဲလိုက်ပြီ။ Lint 0 errors, Build success (local
commit `dcbe291`)။ Database ပြင်စရာ မရှိဘူး။

## ဘာတွေ ပြောင်းလဲ?

- **Header Tab အသစ် (Admin ပဲ မြင်ရတယ်):** အလယ် Nav မှာ ဖန်တီးပါ၊
  ဒီဇိုင်းများ၊ အက်ဒမင်၊ ဖောက်သည် ဝန်ဆောင်မှု တို့ဘေးမှာ **"မှတ်တမ်း"**
  Tab တစ်ခု ပေါ်မယ် — နှိပ်ရင် `/admin/audit` (Audit Log စာမျက်နှာ) ကို
  သွားမယ်။ Customer တွေဆီမှာ ဒီ Tab မပေါ်ဘူး။ ဖုန်း Hamburger Menu
  ထဲမှာလည်း ပေါ်တယ်။
- **စာမျက်နှာ အသစ် `/admin/audit`:** Admin ပဲ ဝင်လို့ရတယ် (Customer/
  Guest ဝင်ရင် /create ကို ပြန်ပို့မယ်)။ နောက်ဆုံး မှတ်တမ်း ၁၀၀ အထိ ပြမယ်
  (အရင် Dashboard မှာ ၅၀ ပဲ ပြတာ) — ဘယ်သူ ဘာလုပ်ခဲ့လဲ၊ ဘယ်သူ့ကို၊
  ဘယ်အချိန်က ဆိုတာ အရင်အတိုင်း။ အပေါ်မှာ "← Admin Dashboard ကို
  ပြန်သွားပါ" Link ပါတယ်။
- **Dashboard (/admin):** Audit Log အပိုင်း ဖြုတ်လိုက်ပြီ။ Suspend/Flag
  လုပ်ရင် ပေါ်တဲ့ အကြောင်းကြားစာကတော့ Users အပိုင်းမှာ ဆက်ပေါ်မယ်
  (အရင် Audit Log အပိုင်းမှာ ပြတာ၊ အခု Users အပိုင်းကို ရွှေ့ထားတယ်)။

## Copy-in အဆင့်

Pack ထဲက ဖိုင် ၅ ခု ကို `D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း
ကူးထည့်ပါ (ဖိုင်အဟောင်းကို အစားထိုးပါ) → Commit → Push → Vercel Ready →
Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

1. **Admin Account နဲ့ Login** → Header အလယ်မှာ "မှတ်တမ်း" Tab ပေါ်ရမယ် →
   နှိပ်ရင် /admin/audit ပွင့်ပြီး မှတ်တမ်း စာရင်း ပေါ်ရမယ် (၁၀၀ အထိ)။
2. /admin Dashboard မှာ Audit Log အပိုင်း မရှိတော့ဘူး။
3. User တစ်ယောက်ကို Suspend လုပ် → Users အပိုင်းမှာ အကြောင်းကြားစာ
   ပေါ်ရမယ်။
4. **Customer Account နဲ့ /admin/audit ရိုက်ဝင်** → /create ကို ပြန်ရောက်ရမယ်။
5. **Customer Account နဲ့ Login** → Header မှာ "မှတ်တမ်း" Tab မပေါ်ရဘူး။

## ဖိုင်စာရင်း (၅ ဖိုင်)

- `src/app/admin/audit/page.tsx` — အသစ် (Audit Log စာမျက်နှာ)
- `src/app/admin/page.tsx` — Audit Log အပိုင်း ဖြုတ် + Suspend/Flag စာကို Users အပိုင်းကို ရွှေ့
- `src/components/AuthNav.tsx` — `AdminAuditNavLink` အသစ် (Admin ပဲ မြင်ရတဲ့ Tab)
- `src/components/SiteHeader.tsx` — အလယ် Nav မှာ Tab ထည့်
- `src/lib/i18n.ts` — `nav.audit` Key အသစ် (မြန်မာ + အင်္ဂလိပ်)

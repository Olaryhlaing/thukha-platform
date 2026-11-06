# Support Inbox — Header Tab (2026-11-06)

ဖောက်သည် ဝန်ဆောင်မှု (Ticket Inbox) ကို Admin Dashboard ထဲက ခလုတ် အဖြစ်
မထားတော့ဘဲ Header Nav မှာ Tab တစ်ခု အနေနဲ့ ထားလိုက်ပြီ။ Lint 0 errors,
Build success (local commit `921ae9e`)။ Database ပြင်စရာ မရှိဘူး။

## ဘာတွေ ပြောင်းလဲ?

- **Header Tab အသစ် (Admin ပဲ မြင်ရတယ်):** အလယ် Nav မှာ ဖန်တီးပါ၊
  ဒီဇိုင်းများ၊ အက်ဒမင် တို့ဘေးမှာ **"ဖောက်သည် ဝန်ဆောင်မှု"** Tab တစ်ခု
  ပေါ်မယ် — နှိပ်ရင် `/admin/support` (Inbox စာမျက်နှာ) ကို သွားမယ်။
  Customer နဲ့ Guest တွေဆီမှာ ဒီ Tab မပေါ်ဘူး (သူတို့ဆီမှာ "အကူအညီ"
  Tab အရင်အတိုင်း ရှိတယ်)။ ဖုန်း Hamburger Menu ထဲမှာလည်း ပေါ်တယ်။
- **Dashboard (/admin):** အပေါ်က "💬 ဖောက်သည် ဝန်ဆောင်မှု (Ticket များ) →"
  ခလုတ် ဖြုတ်လိုက်ပြီ — Dashboard မှာ Stats, Users, Health, Audit Log,
  Announcements ပဲ ကျန်တယ်။
- **Inbox စာမျက်နှာ (/admin/support) မပြောင်းလဲဘူး** — Ticket စာရင်း၊
  အဖြေရေးတဲ့ Box၊ ဖြေရှင်းပြီးရင် Lock ဖြစ်တာတွေ အရင်အတိုင်း။

## Copy-in အဆင့်

Pack ထဲက ဖိုင် ၄ ခု ကို `D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း
ကူးထည့်ပါ (ဖိုင်အဟောင်းကို အစားထိုးပါ) → Commit → Push → Vercel Ready →
Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

1. **Admin Account နဲ့ Login** → Header အလယ်မှာ "ဖောက်သည် ဝန်ဆောင်မှု"
   Tab ပေါ်ရမယ် (ဖန်တီးပါ၊ ဒီဇိုင်းများ၊ အက်ဒမင် တို့ဘေးမှာ) →
   နှိပ်ရင် /admin/support ပွင့်ရမယ်။
2. /admin Dashboard မှာ Inbox ခလုတ် မရှိတော့ဘူး။
3. **Customer Account နဲ့ Login** → Header မှာ "ဖောက်သည် ဝန်ဆောင်မှု" Tab
   မပေါ်ရဘူး — "အကူအညီ" Tab ပဲ ပေါ်ရမယ်။

## ဖိုင်စာရင်း (၄ ဖိုင်)

- `src/components/AuthNav.tsx` — `AdminSupportNavLink` အသစ် (Admin ပဲ မြင်ရတဲ့ Tab)
- `src/components/SiteHeader.tsx` — အလယ် Nav မှာ Tab ထည့်
- `src/app/admin/page.tsx` — Dashboard က Inbox ခလုတ် ဖြုတ်
- `src/lib/i18n.ts` — `nav.supportInbox` Key အသစ် (မြန်မာ + အင်္ဂလိပ်)

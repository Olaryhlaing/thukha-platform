# Admin — အကူအညီ Link ဖြုတ်ခြင်း (2026-11-06)

Admin တွေအတွက် အကူအညီ (/support) ကို ဖြုတ်လိုက်ပြီ။ Lint 0 errors,
Build success (local commits `751eb0d` + `7512255`)။ Database ပြင်စရာ မရှိဘူး။

## ဘာတွေ ပြောင်းလဲ?

- **Header:** Admin Account နဲ့ ဝင်ထားရင် အလယ်က Nav မှာ "အကူအညီ" Link
  မပေါ်တော့ဘူး။ Customer နဲ့ Guest တွေဆီမှာ အရင်အတိုင်း ပေါ်နေမယ်
  (Customer က Ticket တင်တာ၊ Guest က FAQ ဖတ်တာ အတွက်)။
- **/support တိုက်ရိုက် ဝင်ရင်:** Admin က /support ကို တိုက်ရိုက် ရိုက်ဝင်ရင်
  /admin ကို တန်း ပြန်ပို့မယ် — အဲဒီမှာ Ticket တွေကို ဖြေရမှာ ဖြစ်လို့။
- **Customer ဘက် မပြောင်းလဲဘူး:** /support, Ticket တင်တာ, ကိုယ့် Ticket
  စာရင်းနဲ့ Admin အဖြေ ကြည့်တာတွေ အရင်အတိုင်း အလုပ်လုပ်တယ်။

## Copy-in အဆင့်

Pack ထဲက ဖိုင် ၃ ခု ကို `D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း
ကူးထည့်ပါ (ဖိုင်အဟောင်းကို အစားထိုးပါ) → Commit → Push → Vercel Ready →
Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

1. **Admin Account နဲ့ Login** → Header အလယ်မှာ "အကူအညီ" မရှိရဘူး —
   Create, Designs, Admin ပဲ ရှိရမယ်။
2. Address Bar မှာ `thukha-platform-tagc.vercel.app/support` ရိုက်ဝင် →
   /admin ကို တန်း ပြန်ရောက်ရမယ်။
3. **Customer Account နဲ့ Login** → Header မှာ "အကူအညီ" ပေါ်နေရမယ် →
   နှိပ်ရင် /support ပွင့်ပြီး Ticket တင်လို့ ရရမယ်။

## ဖိုင်စာရင်း (၃ ဖိုင်)

- `src/components/AuthNav.tsx` — `SupportNavLink` အသစ် (Admin ဆို Link မပြ၊ တခြားသူဆို ပြ)
- `src/components/SiteHeader.tsx` — အလယ် Nav က /support Link အဟောင်းကို `SupportNavLink` နဲ့ အစားထိုး
- `src/app/support/page.tsx` — Admin ဆို /admin ကို တန်း ပြန်ပို့ (redirect)

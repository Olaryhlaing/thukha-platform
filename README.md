# Support စာမျက်နှာ — Desktop မှာ ၂ Column (2026-11-06)

Lint 0 errors, Build success (local commit `1822285`)။ Database ပြင်စရာ
မရှိဘူး — Code ပဲ။

## ဘာတွေ ပြောင်းလဲ?

- **Desktop (lg နဲ့ အထက်):** စာမျက်နှာ အကျယ် `max-w-6xl` ဖြစ်သွားပြီး
  ၂ Column ဖြစ်မယ် —
  - **ဘယ်ဘက်:** Ticket တင်တဲ့ Form + ကိုယ့် Ticket များ (အပေါ်အောက် စီထားတယ်)
  - **ညာဘက် (380px):** အမေးများတဲ့ မေးခွန်းများ (FAQ) — Scroll လုပ်ရင်
    အပေါ်မှာ ကပ်နေမယ် (sticky)၊ Form ဘက် ရှည်သွားရင်တောင် FAQ ကို
    အမြဲ မြင်နေရမယ်။
- **Mobile/Tablet:** အရင်အတိုင်း ၁ Column — Form → ကိုယ့် Ticket များ →
  FAQ အစဉ်လိုက် ပေါ်မယ်။ ဘာမှ မပြောင်းလဲဘူး။
- Form, Ticket စာရင်း, Notification Link (`#tickets`) တွေရဲ့ အလုပ်လုပ်ပုံ
  အရင်အတိုင်း။

## Copy-in အဆင့်

Pack ထဲက ဖိုင် ၁ ခု (`src/app/support/page.tsx`) ကို
`D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း ကူးထည့်ပါ (ဖိုင်အဟောင်းကို
အစားထိုးပါ) → Commit → Push → Vercel Ready → Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

1. **Desktop Browser** မှာ /support ဖွင့် → ဘယ်ဘက်မှာ Ticket Form +
   ကိုယ့် Ticket များ၊ ညာဘက်မှာ FAQ ဆိုပြီး ဘေးချင်းကပ် ပေါ်ရမယ်။
2. အောက်ကို Scroll လုပ် → FAQ က အပေါ်မှာ ကပ်နေရမယ်။
3. **ဖုန်း** မှာ /support ဖွင့် → အရင်အတိုင်း ၁ Column (Form → Ticket
   များ → FAQ) ဖြစ်နေရမယ်။

## ဖိုင်စာရင်း (၁ ဖိုင်)

- `src/app/support/page.tsx` — Desktop ၂ Column Grid + Sticky FAQ

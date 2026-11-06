# Header + Footer — ဘော်ဒီနဲ့ ကွဲတဲ့ အရောင် (2026-11-06)

Lint 0 errors, Build success (local commit `fb23341`)။ Database ပြင်စရာ
မရှိဘူး — Code ပဲ။

## ဘာတွေ ပြောင်းလဲ?

Header နဲ့ Footer က အရင်က ဘော်ဒီနဲ့ အရောင် တူလုနီးပါး ဖြစ်နေတယ် (အဖြူ
အကြည် / Indigo အကြည်) — အခု သီးသန့် အရောင် အပြည့်အဝ ဖြစ်သွားပြီ:

- **Light Mode:** Header + Footer = **အရောင် #EDE9FE** (Lavender နုနု —
  Login စာမျက်နှာရဲ့ Hero အရောင် အတိုင်း)၊ ဘော်ဒီက အဖြူ ဖြစ်လို့ ကွဲသွားမယ်။
- **Dark Mode:** Header + Footer = **အရောင် #1A1740** (Indigo-Violet ရင့်)၊
  ဘော်ဒီက #10113D ဖြစ်လို့ ကွဲသွားမယ်။
- အကြည် (transparency/blur) ကို ဖြုတ်ပြီး အရောင် အပြည့် ထားတယ် — အရောင်
  ကွဲတာ ပိုသိသာအောင်။
- ဖုန်း Hamburger Menu ဖွင့်ထားရင်လည်း Header အရောင် အတိုင်း ဖြစ်မယ်။
- အောက်ခြေ အရောင် Gradient လိုင်း (2px) နဲ့ စာတွေ၊ Link တွေ၊ ခလုတ်တွေရဲ့
  အရောင်က အရင်အတိုင်း — အသစ်က အရောင်ပေါ်မှာ ဖတ်လို့ ရတယ်။

## Copy-in အဆင့်

Pack ထဲက ဖိုင် ၂ ခု ကို `D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း
ကူးထည့်ပါ (ဖိုင်အဟောင်းကို အစားထိုးပါ) → Commit → Push → Vercel Ready →
Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

1. စာမျက်နှာ ဖွင့် → Header (အပေါ်) နဲ့ Footer (အောက်) က ဘော်ဒီ
   (အလယ်) ထက် Lavender နုနု ဖြစ်နေရမယ် (Light Mode)။
2. Dark Mode ပြောင်း → Header + Footer က ဘော်ဒီထက် ပိုရင့်တဲ့
   Indigo-Violet ဖြစ်နေရမယ်။
3. ဖုန်းမှာ Hamburger Menu (☰) ဖွင့် → Menu ထဲကလည်း Header အရောင်
   အတိုင်း ဖြစ်နေရမယ်။

## ဖိုင်စာရင်း (၂ ဖိုင်)

- `src/components/SiteHeader.tsx` — Header အရောင် `#EDE9FE` / Dark `#1A1740` (အပြည့်)
- `src/components/SiteFooter.tsx` — Footer အရောင် `#EDE9FE` / Dark `#1A1740` (အပြည့်)

# Burmese UI — မြန်မာဘာသာ ရွေးထားရင် အကုန် မြန်မာလို ဖြစ်အောင် (2026-11-06)

မြန်မာဘာသာ ရွေးထားရင် ကျန်နေတဲ့ အင်္ဂလိပ်စာတွေကို မြန်မာလို ပြင်ထားတယ်။
Lint 0 errors, Build success (local commit `f79fa5c`)။

## ဘာတွေ ပြောင်းလဲ

- **Header / Nav:** Create → ဖန်တီးပါ, Designs → ဒီဇိုင်းများ, Admin → အက်ဒမင်, Login → ဝင်ပါ, Signup → အကောင့်ဖွင့်ပါ, Logout → ထွက်ပါ, Account → အကောင့်, Privacy → ကိုယ်ရေးအချက်အလက်။
- **ခလုတ်နဲ့ ခေါင်းစဉ်:** Login/Signup စာမျက်နှာ ခေါင်းစဉ်, Password → စကားဝှက်, Email → အီးမေးလ်, Light/Dark → အလင်း/အမှောင်, Admin Dashboard → အက်ဒမင် ဒက်ရှ်ဘုတ်, Users → အသုံးပြုသူများ, Suspend/Flag → ပိတ်ပါ/အမှတ်အသား, Token ဖြည့်တာ/Export/Health/Announcements/Audit Log ခေါင်းစဉ်တွေ အကုန် မြန်မာလို။
- **Badge တွေ:** "Admin Operations Center" → အက်ဒမင် လုပ်ဆောင်ချက် စင်တာ, "Legal & Security" → ဥပဒေနဲ့ လုံခြုံရေး, "💬 Customer Service" → 💬 ဖောက်သည် ဝန်ဆောင်မှု။
- **Footer:** အောက်ခြေ "Privacy" Link ကို ဘာသာစကား လိုက်ပြီး ပြောင်းတော့မယ် (မြန်မာဆို "ကိုယ်ရေးအချက်အလက် မူဝါဒ", အင်္ဂလိပ်ဆို "Privacy Policy") — Footer ကို `SiteFooter` Component အသစ် ခွဲထားတယ်။
- **Error စာတွေ:** Login/Signup/Forgot/Reset/Confirm Error တွေ, Ticket/Error စာတွေ အကုန် မြန်မာလို (Inbox → ဝင်စာပုံး, link → လင့်ခ် အပါအဝင်)။
- **ရက်စွဲ:** /admin, /account, /designs, /support က ရက်စွဲတွေက မြန်မာဘာသာရွေးထားရင် မြန်မာလို ရက်စွဲ (မြန်မာ ဂဏန်း) နဲ့ ပေါ်မယ်၊ အင်္ဂလိပ်ရွေးထားရင် အင်္ဂလိပ်လို ပေါ်မယ်။
- **Aria-label / Placeholder:** မီနူး ဖွင့်/ပိတ် ခလုတ်, ဘာသာစကား ခလုတ်, Signup နာမည် ဥပမာ ("ဥပမာ — အောင်မြင့်")။

## ရည်ရွယ်ချက်နဲ့ အင်္ဂလိပ်လို ကျန်ခဲ့တဲ့ စကားလုံးများ

ဒါတွေက နာမည်/နည်းပညာ စကားလုံး ဖြစ်လို့ တမင် အင်္ဂလိပ်လို ထားတယ် — မြန်မာလို ဘာသာပြန်ရင် ပိုရှုပ်မယ်:
ThuKha Platform, Token, AI, PNG/JPG/WebP, Facebook, Supabase, Cloudflare, Gemini, CSV,
Prompt, Channel အမည် (Facebook post / Story / Cover), Story/Cover Format,
အီးမေးလ် နမူနာ (name@company.com), Supabase Dashboard Menu အမည်များ, /create လို လမ်းကြောင်းများ။
ဘာသာစကား ခလုတ်ပေါ်က "English" စာသားကလည်း တမင် ထားတယ် — အဲဒါက ပြောင်းမယ့် ဘာသာစကား နာမည် ဖြစ်လို့ပါ။

## Copy-in အဆင့်

Database ပြင်စရာ မရှိဘူး — Code ပဲ။ Pack ထဲက ဖိုင် ၁၁ ခု ကို `D:\thukha-platform-fresh` ထဲ
လမ်းကြောင်းအတိုင်း ကူးထည့်ပါ (ဖိုင်အဟောင်းကို အစားထိုးပါ) → Commit → Push → Vercel Ready →
Hard Refresh (Ctrl+Shift+R)။ မြန်မာဘာသာ ရွေးထားပြီး Header, /create, /admin, /support,
/account ကို လှည့်ကြည့်ပါ — အင်္ဂလိပ် စာသား ကျန်မနေတော့ဘူး (အထက်က စာရင်းထဲက နာမည်/နည်းပညာ စကားလုံးတွေကလွဲလို့)။

## ဖိုင်စာရင်း (၁၁ ဖိုင်)

- `src/lib/i18n.ts` — မြန်မာ Key ~290 ခု ဘာသာပြန် + Key အသစ် ၅ ခု (my+en)
- `src/components/SiteFooter.tsx` — အသစ် (Footer ကို ဘာသာစကား လိုက်ပြောင်းဖို့)
- `src/app/layout.tsx` — Footer ကို SiteFooter သုံးတော့မယ်
- `src/app/admin/page.tsx` — Badge/ခေါင်းစဉ် Key သုံး + ရက်စွဲ မြန်မာ Locale
- `src/app/privacy/page.tsx` — Badge Key သုံး
- `src/app/support/page.tsx` — Badge Key သုံး + ရက်စွဲ မြန်မာ Locale
- `src/app/account/page.tsx` — ရက်စွဲ မြန်မာ Locale
- `src/app/designs/page.tsx` — ရက်စွဲ မြန်မာ Locale
- `src/app/signup/page.tsx` — နာမည် Placeholder မြန်မာလို
- `src/components/SiteHeader.tsx` — မီနူး Aria-label Key သုံး
- `src/components/LanguageToggle.tsx` — Aria-label မြန်မာလို

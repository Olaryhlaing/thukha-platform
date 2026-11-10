# Maintenance Mode — Login ခနပိတ်ထားခြင်း (2026-11-10)

Admin က Login + Signup ကို ခနပိတ်ထားလို့ရပြီ။ Lint 0 errors, Build
success (local commits `29692d4` + `8b6c828`)။

## ဘယ်လိုအလုပ်လုပ်လဲ?

- **Admin Dashboard (/admin) မှာ အပိုင်းအသစ် "Login ခနပိတ်ထားခြင်း
  (Maintenance)"** — အခြေအနေ Badge (Login ဖွင့်ထားတယ် / ပိတ်ထားတယ်)
  + "Login ခနပိတ်ပါ" / "Login ပြန်ဖွင့်ပါ" ခလုတ်။ ပိတ်လိုက်/ဖွင့်လိုက်
  တိုင်း Audit Log မှာ မှတ်ထားတယ် (maintenance_on / maintenance_off)။
- **ပိတ်ထားရင် Customer တွေ:**
  - /login မှာ "🔧 စနစ် ခနပိတ်ထားတယ် — အခု Admin ပဲ ဝင်လို့ရတယ်။"
    ဆိုတဲ့ စာ ပေါ်မယ်။ Login လုပ်ကြည့်ရင် ချက်ချင်း ပြန်ထွက်သွားပြီး
    "စနစ် ခနပိတ်ထားလို့ ဝင်လို့ မရသေးဘူး။ နောက်မှ ပြန်ဝင်ကြည့်ပါ။"
    Error ပေါ်မယ်။
  - /signup မှာ Form အစား အဲဒီ စာပဲ ပေါ်ပြီး အကောင့် အသစ် ဖွင့်လို့
    မရဘူး။
- **Admin က ပုံမှန် ဝင်လို့ရတယ်** — /login ကနေ ပုံမှန် ဝင်ပြီး /admin
  ကနေ ပြန်ဖွင့်လို့ရတယ်။ ဒါကြောင့် Lockout ဖြစ်မှာ မဟုတ်ဘူး။

## ⚠️ Supabase အဆင့် — အရင် လုပ်ပါ

Pack ထဲက `supabase/schema.sql` **အပြည့်အစုံ** ကို SQL Editor မှာ Paste →
Run လုပ်ပါ။ အသစ်က `app_settings` Table တစ်ခု ပဲ (တခြား အကုန် "ရှိရင်
မထည့်ဘူး" migration တွေ၊ ပြန် Run လို့ လုံခြုံတယ်)။ ဒီအဆင့် မလုပ်ရင်
Toggle နှိပ်ရင် Error ပြန်မယ်။ Table အရေအတွက် အခု **12** ခု။

## Copy-in အဆင့်

1. Supabase schema အရင် Run (အပေါ်က အဆင့်)။
2. Pack ထဲက ဖိုင် ၇ ခု ကို `D:\thukha-platform-fresh` ထဲ လမ်းကြောင်းအတိုင်း
   ကူးထည့်ပါ (ဖိုင်အဟောင်းကို အစားထိုးပါ) → Commit → Push → Vercel Ready →
   Hard Refresh (Ctrl+Shift+R)။

## စမ်းနည်း

1. **Admin Account နဲ့ Login** → /admin မှာ "Login ခနပိတ်ထားခြင်း
   (Maintenance)" အပိုင်း ရှိရမယ်၊ Badge က "Login ဖွင့်ထားတယ်" ဖြစ်ရမယ်။
2. "Login ခနပိတ်ပါ" နှိပ် → Badge က "Login ပိတ်ထားတယ်" ဖြစ်ရမယ် +
   "သိမ်းပြီးပြီ" ပေါ်ရမယ်။
3. **Customer Account နဲ့ /login မှာ ဝင်ကြည့်** → Maintenance စာ
   ပေါ်ရမယ်၊ Login လုပ်ရင် Error ပေါ်ပြီး ဝင်လို့ မရရဘူး။
4. **Customer Account နဲ့ /signup သွား** → Form မပေါ်ဘဲ Maintenance
   စာပဲ ပေါ်ရမယ်။
5. **Admin Account နဲ့ /login မှာ ဝင်ကြည့်** → ပုံမှန် ဝင်လို့ရရမယ် →
   /admin ကနေ "Login ပြန်ဖွင့်ပါ" နှိပ် → Customer တွေ ပြန်ဝင်လို့ရရမယ်။

## ကန့်သတ်ချက် (အမှန်အတိုင်း)

- **ဝင်ပြီးသား user တွေက ဆက်သုံးနေဦးမယ်** — Maintenance က အသစ်
  ဝင်တာ/အကောင့်ဖွင့်တာကိုပဲ တားတာ။ ဝင်ပြီးသားတွေကို ချက်ချင်း
  ထုတ်ချင်ရင် နောက်ထပ် အလုပ် လိုမယ်။
- ဒါက App အဆင့် ပိတ်တာ — Supabase Dashboard ကနေ တိုက်ရိုက် Auth
  လုပ်လို့ရတဲ့ လမ်းကို မပိတ်ဘူး (Prototype/Beta အတွက် လုံလောက်တယ်)။

## ဖိုင်စာရင်း (၇ ဖိုင်)

- `supabase/schema.sql` — `app_settings` Table အသစ် (12th public table, API-only)
- `src/app/api/maintenance/route.ts` — အသစ် (GET, public — Login/Signup က ဖတ်တယ်)
- `src/app/api/admin/maintenance/route.ts` — အသစ် (POST, admin-only, audit-logged)
- `src/app/admin/page.tsx` — Maintenance Toggle အပိုင်း
- `src/app/login/page.tsx` — Maintenance စာ + Customer ကို Sign-in ပြီးရင် ပြန်ထုတ်တယ်
- `src/app/signup/page.tsx` — Maintenance ဖွင့်ထားရင် Form ပိတ်တယ်
- `src/lib/i18n.ts` — `maintenance.*`, `admin.maint*` Key များ (မြန်မာ + အင်္ဂလိပ်)

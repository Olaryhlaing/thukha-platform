# ThuKha Platform — Gemini မှာ ဆက်လုပ်ဖို့ (2026-11-14)

`GEMINI.md` တစ်ဖိုင်တည်းနဲ့ Gemini မှာ ဆက်လုပ်လို့ရပြီ။ Local commit
`dcbe291` (2026-11-10) အထိ အခြေအနေ အကုန် ပါပြီးသား — 2026-11-03 က
HANDOVER.md အဟောင်းက အခုတော့ ခေတ်နောက်ကျနေပြီ (Batch 1+2, Support,
Notification, Maintenance, Audit Tab, Duplicate Signup Block တို့
မပါဘူး)။

## သုံးနည်း ၂ မျိုး

### ၁။ Gemini CLI (PC မှာ, Code ကို တိုက်ရိုက် ပြင်ခိုင်းချင်ရင်) — အကြံပြုတယ်
1. `GEMINI.md` ကို `D:\thukha-platform-fresh` (Project Folder) ရဲ့
   အမြစ်ထဲ ကူးထည့်ပါ → Commit → Push (ပုံမှန်အတိုင်း)။
2. Terminal/Command Prompt မှာ အဲဒီ Folder ထဲ သွား → `gemini` လို့ ရိုက်ပြီး
   Enter နှိပ်ပါ။
3. Gemini CLI က `GEMINI.md` ကို အလိုအလျောက် ဖတ်ပြီး Project အကြောင်း
   သိသွားမယ်။ ပြီးရင် တစ်ခု‌ချင်း ခိုင်းပါ — ဥပမာ "On /create, show X
   when Y"။
4. CLI က File တွေကို တိုက်ရိုက် ပြင်/စမ်းပေးနိုင်တယ် (`npm run lint`,
   `npm run build` ပါ လုပ်ပေးတယ်)။ Push/Deploy ကတော့ ကိုယ်တိုင် လုပ်ပါ။

### ၂။ Gemini Web (gemini.google.com, Chat မှာ မေးချင်ရင်)
1. https://gemini.google.com ဖွင့် → Chat အသစ်။
2. `GEMINI.md` File ရဲ့ အကြောင်းအရာ အကုန်လုံးကို Copy → Chat ထဲ Paste
   လုပ်ပါ။ ပြီးရင် တစ်ခု‌ချင်း ခိုင်းပါ (GEMINI.md ရဲ့ အပိုင်း ၉ မှာ
   Starter Prompt ပါပြီးသား)။
3. **သတိထားရမှာ:** Web Chat က ကိုယ့် Computer ရဲ့ File တွေကို မမြင်ရဘူး၊
   မပြင်ပေးနိုင်ဘူး — Code ကို Chat ထဲမှာ ရေးပေးရုံပဲ၊ ကိုယ်တိုင် ကူးထည့်ရမယ်။
   File ပြင်တာ၊ Build စမ်းတာ လိုချင်ရင် CLI (နည်းလမ်း ၁) ကို သုံးပါ။

## အရေးကြီးတဲ့ သတိပေးချက်

- **API Key / Password ကို Gemini Chat ထဲ ဘယ်တော့မှ မထည့်ပါနဲ့** —
  GEMINI.md ထဲမှာလည်း Key နာမည်ပဲ ပါတယ်၊ Key တန်ဖိုး မပါဘူး။
- Gemini ကို တစ်ခါတည်း အများကြီး မခိုင်းပါနဲ့ — တစ်ခု‌ချင်း၊ အသေးစိတ်
  ခိုင်းပါ။ ပြီးရင် Diff ကို သေချာဖတ်၊ Browser မှာ စမ်း၊ ပြီးမှ
  နောက်တစ်ခုကို ဆက်ပါ။
- Gemini က အသစ်ကနေ ပြန်စဖို့ ကြိုးစားရင် GEMINI.md ကို ပြန်ဖတ်ခိုင်းပါ။

## ဖိုင်စာရင်း (၁ ဖိုင် + ဒီ README)

- `GEMINI.md` — ThuKha Project အကြောင်း အကုန် (Stack, Route များ,
  Token/Pricing, Database 12 Table, စည်းမျဉ်း, လက်ရှိ အခြေအနေ,
  လုပ်ဖို့ ကျန်တာများ, Starter Prompt)

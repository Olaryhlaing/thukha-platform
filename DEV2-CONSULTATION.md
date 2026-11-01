# Dev Two နဲ့ တိုင်ပင်ဖို့ — ThuKha UI / Editor Consultation Pack

> အတွက်: Dev Two (အကြံပြု: Saw Thurizza — Frontend & Canvas UI / Konva.js)
> မှ: Olary (Dev One / Lead)
> ရည်ရွယ်ချက်: UI Plan + /create editor ကို မဆောက်ခင် Dev Two ရဲ့ ဆုံးဖြတ်ချက်တွေ ယူဖို့
> အခြေခံ files: `UI-PLAN.md`, `TASK-SPLIT-2-DEVS.md`, `DEV1-DETAILED-GUIDE.md`
> မှတ်ချက်: Dev Two က တခြားလူဆိုရင် နာမည်ပဲ လဲပါ — မေးခွန်းတွေက အတူတူပဲ။

---

## ၁. တိုင်ပင်ရမယ့် အကြောင်းအရင်း (၂ မိနစ်နဲ့ ပြောလို့ရအောင်)

ThuKha ကို အစဆုံး fresh build လုပ်နေပါတယ် (old code မသုံး)။
UI Plan ချပြီးပြီ၊ ဒါပေမယ့် /create editor ကို ဘယ်ပုံစံနဲ့ ဆောက်မလဲ ဆိုတာ
Dev Two ရဲ့ အတွေ့အကြုံ (Konva.js) နဲ့ ဆုံးဖြတ်မှ Nov 14 prototype မီမယ်။
ဒီ pack မှာ ဆုံးဖြတ်ရမယ့် မေးခွန်း ၁၀ ခုပဲ ပါပါတယ် — အဖြေတွေရပြီးတာနဲ့
Dev Two က `ui/*` branch မှာ စလို့ရပြီ။

---

## ၂. ဆုံးဖြတ်ရမယ့် မေးခွန်း ၁၀ ခု

### Q1. Editor v1 ကို ဘယ်နည်းနဲ့ စမလဲ? (အရေးကြီးဆုံး)
- **Option A (အကြံပြု): Canvas 2D + side form**
  - Text/logo ကို form နဲ့ ပြင် (headline input, size slider, colour select)
  - Preview = export PNG အတိုင်း တိကျတယ်၊ ဆောက်ရမြန်တယ်
  - အားနည်းချက်: canvas ပေါ်မှာ တိုက်ရိုက် ဆွဲရွှေ့လို့ မရသေးဘူး
- **Option B: Konva.js ကို အစကနေ သုံး**
  - Canvas ပေါ်မှာ တိုက်ရိုက် ရွှေ့ / အရွယ်ပြောင်း / လှည့်လို့ရတယ်
  - အားနည်းချက်: အချိန်ပိုကြာတယ်၊ Burmese wrapping + export စမ်းရတာ ပိုများတယ်
- **မေးရန်:** Nov 14 မီဖို့ A နဲ့ စပြီး Konva ကို v2 (beta) မှာ ထည့်တာ သဘောတူလား?

### Q2. Mobile editor ကို ဘယ်လို စီစဉ်မလဲ?
- အကြံပြု: ၁ column + Step tabs (Brief → Editor → Export)၊
  preview ကို sticky မထားဘူး (form ကို ဖုံးသွားလို့ပါ)။
- မေးရန်: Preview ကို step တိုင်းမှာ အပေါ်မှာ အကျဉ်းပြတာနဲ့
  အောက်ဆုံးမှာ အပြည့်ပြတာ၊ ဘယ်ဟာ ပိုအဆင်ပြေမလဲ?

### Q3. Text ကို ဘယ်လို ရွေးပြီး ပြင်မလဲ?
- Option A: Side form မှာပဲ ပြင် (v1, ရိုးရှင်း)
- Option B: Canvas ပေါ်က စာကို နှိပ်ပြီး ပြင် (Konva လိုအပ်)
- Option C: Layer list ကနေ ရွေး → side form မှာ ပြင် (v1 + v2 ကြား)
- မေးရန်: v1 မှာ C ကို လက်ခံလား?

### Q4. Burmese typography — ဘာတွေ စမ်းရမလဲ?
- Line-height 1.5–1.7၊ heading 600–700၊ Noto Sans Myanmar
- Test strings: stacked စာလုံး၊ ဈေးနှုန်း `၅၉,၀၀၀ ကျပ်`၊
  Thai + English ရောတာ၊ ရှည်တဲ့ headline
- မေးရန်: နောက် test case ထပ်ထည့်ချင်တာ ရှိလား?
  (ဥပမာ — ဖုန်းနံပါတ်၊ လိပ်စာ၊ အထူးအက္ခရာ)

### Q5. Templates — အရင် ၃ ခု မှန်လား?
- အကြံပြု: စားသောက်ဆိုင်၊ Online shop၊ အလှအပ/ဝန်ဆောင်မှု
- မေးရန်: ဒီ ၃ ခုပဲ အရင်လုပ်မလား၊ တခြား vertical (ဥပမာ — ဆေးဆိုင်၊
  ပရိဘောဂ) ထည့်ချင်လား? Template copy ကို Mann Yin Kwin ဆီက
  ဘယ်တော့ ရမလဲ?

### Q6. Preview = Export ကို ဘယ်လို အာမခံမလဲ?
- အကြံပြု: Export လုပ်တိုင်း screen preview နဲ့ PNG file ကို ဘေးချင်း
  ယှဉ်စစ်တဲ့ checklist (စာ မညှပ်ဘူး၊ logo မဆန့်ဘူး၊ အရောင် မပြောင်းဘူး)
- မေးရန်: ဒီ manual checklist လုံလောက်လား၊ automated test
  (screenshot compare) လိုလား?

### Q7. Violet/Lilac Design — ပြောင်းချင်တာ ရှိလား?
- အခု plan: Violet #5946ED CTA၊ Lilac #A78BFA accent/glow အများဆုံး၊
  Indigo စာသားအတွက်ပဲ၊ rounded-2xl cards
- မေးရန်: Hero၊ button၊ card ပုံစံ ပြောင်းချင်တာ ရှိလား?
  Splash/logo သုံးပုံ အဆင်ပြေလား?

### Q8. QA UI — Warning လား၊ Block လား?
- အကြံပြု: Warning ပဲ ပြ (အဝါရောင် box)၊ export ကို မတားဘူး
- မေးရန်: ဈေး/ဖုန်း မှားနေရင် export ကို တားသင့်လား၊
  ဒါမှမဟုတ် သတိပေးရုံနဲ့ လုံလောက်လား?

### Q9. Timeline + အလုပ်ချိန် — Nov 14 မီလား?
- Dev Two: Nov 1–7 Home + /create UI + editor v1 + PNG export
- နှစ်ယောက်: Nov 8–14 API + editor ချိတ်ဆက်
- မေးရန်: ဒီ timeline အဆင်ပြေလား? စာမေးပွဲ / တခြား အလုပ်
  ပိတ်နေတဲ့ ရက် ရှိလား? ရှိရင် ဘယ်ရက်တွေလဲ?

### Q10. အလုပ်လုပ်ပုံ — Branch / Sync
- Dev Two branch: `ui/*`၊ Dev One file (`src/lib/*`, `src/app/api/*`)
  ကို review မပါဘဲ မပြင်ရ၊ အပြန်အလှန်လည်း ထို့အတူ
- နေ့စဉ် 30 မိနစ် sync — ဘယ်အချိန် အဆင်ပြေလဲ?
- မေးရန်: Sync channel က ဘာသုံးမလဲ? (အရင် team announcement မှာ
  မဆုံးဖြတ်ရသေးပါ — chat / GitHub / Drive ထဲက တစ်ခု ရွေးပါ)

---

## ၃. Meeting Agenda — ၃၀ မိနစ်

| မိနစ် | အကြောင်း |
|---|---|
| 0–5 | ThuKha fresh build + UI plan အကျဉ်း (Olary ပြော) |
| 5–15 | Q1–Q4: Editor + Mobile + Burmese test (Dev Two အဓိက) |
| 15–22 | Q5–Q8: Templates + Preview/Export + QA + Design |
| 22–28 | Q9–Q10: Timeline + branch/sync သဘောတူ |
| 28–30 | ဆုံးဖြတ်ချက်တွေ ချရေး + နောက် step သတ်မှတ် |

**Meeting ပြီးရင် ထွက်လာရမယ့် အရာ:**
- [ ] Q1–Q10 အဖြေ (တစ်ခုချင်း)
- [ ] Dev Two စမယ့် ရက် + ပထမ PR (`ui/create`)
- [ ] Dev One က ပေးရမယ့် အရာ (API contract doc, canvas JSON နမူနာ)
- [ ] နောက် sync ရက်/အချိန်

---

## ၄. Dev Two ကို ပို့လို့ရတဲ့ တိုတို Message (Copy လုပ်ပြီး ပို့လို့ရ)

> Saw, ThuKha အတွက် UI plan + /create editor ကို တိုင်ပင်ချင်လို့။
> Fresh build (old code မသုံး) မှာ Dev Two အပိုင်းက Home, /create UI,
> editor, templates ပဲ။ အဓိက ဆုံးဖြတ်ရမှာက editor v1 ကို Canvas 2D +
> side form နဲ့ စမလား၊ Konva ကို အစကနေ သုံးမလားဆိုတာပဲ —
> ကျွန်တော် အကြံပြုတာက Nov 14 မီဖို့ Canvas 2D နဲ့ စပြီး Konva ကို v2 မှာ
> ထည့်တာပါ။ ၃၀ မိနစ် meeting တစ်ခု လုပ်ပြီး မေးခွန်း ၁၀ ခုကို
> အတူတူ ဆုံးဖြတ်ချင်တယ်။ မင်းအတွက် ဘယ်အချိန် အဆင်ပြေလဲ?
> File တွေက `UI-PLAN.md` နဲ့ `TASK-SPLIT-2-DEVS.md` မှာ ရှိတယ်။

---

## ၅. Dev Two ရဲ့ အပိုင်း အကျဉ်း (တိုင်ပင်ချိန် လက်ထဲ ထားဖို့)

- Pages: `/`, `/create`, `/templates`, `/brands` (UI), `/designs` (UI)
- Editor: Layer ၃ ခု (background / text / logo), text ပြင်၊ logo မူရင်းအတိုင်း
- Files: `src/app/create/*`, `src/components/editor/*`, `src/components/ui/*`
- မလုပ်ရ: API key, RLS, DB schema, deploy config (အဲဒါ Dev One အပိုင်း)
- Done: login မလိုဘဲ /create မှာ brief → headline ပြင် → logo တင် →
  PNG download ရတယ်; Burmese test strings မပျက်ဘူး; phone မှာ သုံးလို့ရတယ်

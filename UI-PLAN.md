# ThuKha Platform — UI Plan (Fresh Build)

> အခြေခံ: 2026-10-28 framework + Dev 1/Dev 2 task split
> အရောင်: Violet #5946ED (CTA/link) + Lilac #A78BFA (accent/glow) အများဆုံး
> Indigo #10113D က စာသားအတွက်ပဲ၊ Lilac/teal ကို body text အဖြစ် မသုံးရ
> Font: Noto Sans Myanmar (Burmese) + Inter (Latin)
> Language: Burmese-first၊ English က label အသေးအဖြစ် တွဲပြမယ်

---

## ၁. Global UI — Page တိုင်းမှာ ပါမယ့် အရာတွေ

**Top Nav (Desktop + Mobile)**
- ဘယ်: ThuKha logo (40px) + "ThuKha Platform" စာသား
- အလယ်/ညာ: Home, Templates, Create, My Designs (login ပြီးမှ)
- ညာဆုံး CTA: Violet pill button "စတင်ဖန်တီးပါ" — အမြဲ ပေါ်နေရမယ်
- Mobile: nav ကို ရိုးရှင်းအောင် လုပ် — logo + Create CTA ပဲ အဓိက ထား၊
  ကျန်တာကို menu / link list အဖြစ် အောက်မှာ ထား

**Footer**
- Tagline: သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ်
- Links: Templates, Create, Terms/Privacy (နောက်မှ)

**Design Tokens**
- Card: rounded-2xl (16px), border Lilac/40, shadow သန့်သန့်
- Primary button: Violet bg, အဖြူ စာ, hover → Lilac
- Secondary button: အဖြူ bg, Violet border + Violet စာ
- Input/select/textarea: rounded-xl, Lilac border, focus မှာ Violet ring
- Touch target: အနည်းဆုံး 44px (phone မှာ နှိပ်ရလွယ်အောင်)
- Burmese line-height: 1.5–1.7, heading bold 600–700
- Contrast: အဖြူ စာက Violet ပေါ်မှာပဲ၊ Indigo စာက အဖြူ/mist ပေါ်မှာပဲ

**States — UI တိုင်းမှာ ဒါတွေ ရှိရမယ်**
- Loading: AI ထုတ်နေချိန် spinner + "ထုတ်နေပါတယ်…" (ခလုတ် disable)
- Error: မြန်မာလို ရှင်းတဲ့ message + "ထပ်ကြိုးစားပါ" ခလုတ်
- Success: PNG download ပြီးရင် "Download ပြီးပါပြီ" toast
- Empty: design/template မရှိရင် "အသစ် ဖန်တီးပါ" နဲ့ ဥပမာ ပြပါ
- Disabled: caption မရှိရင် Copy ခလုတ် မှိန်နေရမယ်

**v1 မှာ မပါဘူး**
Dark mode toggle, language toggle (Burmese-first ပဲ), chat box, notification bell

---

## ၂. Home `/` — ဘာတွေပါမလဲ

1. **Hero (Violet → Lilac gradient card)**
   - Logo + "ThuKha Platform"
   - H1: သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ်
   - Sub: ၁ မိနစ်အတွင်း မြန်မာစာမှန်တဲ့ promo post
   - CTA ၂ ခု: "စတင်ဖန်တီးပါ" (အဖြူ) + "Templates ကြည့်ပါ" (outline)
   - Splash image — ညာဘက် (desktop) / အောက် (mobile)
   - Note သေး: "/create ကို login မလိုဘဲ စမ်းလို့ရတယ်"
2. **Workflow — ၄ ဆင့် cards**
   Brief → AI Background → မြန်မာစာ + Logo → Export + Caption
3. **AI မှာ ဘာတွေပါလဲ** — ၅ ချက် list (background, caption, product photo, QA, fallback/log)
4. **Launch Timeline** — Oct 27–31, Nov 1–14, Nov 15–24, Dec 1–7
5. **Final CTA** — "Prototype ကို အခု စမ်းကြည့်ပါ → /create"

---

## ၃. Create `/create` — အဓိက UI (အသေးစိတ်ဆုံး)

Layout:
- **Desktop:** ၂ column — ဘယ် = form (ပြင်စရာ), ညာ = live preview (sticky)
- **Mobile:** ၁ column — Step tabs နဲ့ သွား၊ preview ကို step တိုင်းမှာ
  အပေါ်မှာ အကျဉ်းပြမယ်၊ အပြည့်ကြည့်ချင်ရင် scroll ဆင်းပါ

**Step Indicator (အပေါ်မှာ အမြဲ)**
- Step 1: Brief — Step 2: Editor — Step 3: Export
- လက်ရှိ step ကို Violet အပြည့်၊ ပြီးတဲ့ step ကို Lilac၊ မရောက်သေးတာကို မီးခိုးရောင်

### Step 1 — Brief Form (Card ၁ ခု)
- လုပ်ငန်းအမျိုးအစား: select (စားသောက်ဆိုင်, Online shop, အလှအပ, ဝန်ဆောင်မှု, Agency, အခြား)
- လုပ်ငန်းအမည်: input (ဥပမာ — Yangon Kitchen)
- Product / ဝန်ဆောင်မှု: input (ဥပမာ — မုန့်ဟင်းခါး)
- Target customer: input (ဥပမာ — Bangkok ရှိ မြန်မာမိသားစုများ)
- Campaign goal: select (ရောင်းအား တိုးရန်, Brand သိစေရန်, Promotion ကြေညာရန်)
- Channel: select (Facebook post, Story, Cover, Menu/product card)
- Budget range: input
- အောက် summary line အသေး: "Brief: … • … • …" (user ဘာဖြည့်ထားလဲ ပြန်မြင်ရအောင်)

### Step 2 — Editor (Card ၂ ခု: Text + Layers)
**Text Layer Card**
- Headline: textarea (၂ ကြောင်း)
- Test strings ခလုတ်များ (စမ်းကြည့်ရန်):
  - Stacked စာလုံး၊ ဈေးနှုန်း `၅၉,၀၀၀ ကျပ်`၊ Thai + English ရောတာ၊ tagline
  - နှိပ်တာနဲ့ headline ကို အဲဒီ စာနဲ့ လဲပေးမယ်
- Subheadline: input
- CTA: input + ဈေးနှုန်း: input (၂ column)
- Headline size: slider 48–120px + ဂဏန်း ပြပါ
- Headline colour: select — အဖြူ (Violet/Lilac ပေါ်) / Indigo (အလင်းပေါ်)

**Layers Card**
- Format: select cards — Post 1080×1080, Story 1080×1920, Cover 1200×630
- Background: Violet/Lilac presets (Violet→Lilac, Lilac→Violet, Deep Violet→Lilac)
  + ကိုယ့်ပုံ upload (optional) — upload လုပ်ရင် gradient အစား အဲဒီပုံကို သုံးမယ်
  + Note: "AI background အစစ်က နောက်မှ ဝင်လာမယ်"
- Business logo upload (optional) — မူရင်းအတိုင်း တင်မယ်၊ AI ပြန်မဆွဲဘူး
- Layer list (v1): Background / Text / Logo — အစဉ်လိုက် ပြပါ၊
  v2 မှာ drag / show-hide / move-resize-rotate ထည့်မယ်

**Live Preview Card (ညာ column)**
- Canvas preview — format အတိုင်း အချိုး (post = square, story = tall, cover = wide)
- Preview အောက် note: "Export လုပ်တဲ့ PNG က ဒီ preview အတိုင်းပဲ ထွက်မယ်"
- Preview မှာ: background → headline → subheadline → CTA pill (Violet) →
  logo (အပေါ်မှာ) အစဉ်လိုက် ပေါ်ရမယ်

### Step 3 — Caption + QA + Export (Card ၁ ခု)
- "Caption draft ဖန်တီးပါ" ခလုတ် (template — AI နောက်မှ) → caption textarea မှာ ၃ မျိုး မဟုတ်၊
  ၁ ခု draft အရင် ထွက်မယ်၊ API ချိတ်ပြီးရင် ၃ မျိုး ရွေးလို့ရမယ်
- Caption textarea — ပြင်လို့ရ၊ Copy ခလုတ် (copy ပြီးရင် "Copied ✓")
- QA Checklist (checkbox ၄ ခု):
  - စာလုံးပေါင်း စစ်ပြီးပြီ
  - ဈေးနှုန်း / ဖုန်း စစ်ပြီးပြီ
  - Logo မူရင်းအတိုင်း — AI က ပြန်မဆွဲပါ
  - Stereotype မပါပါ
- QA API warning ပေါ်ရင်: အဝါရောင် warning box နဲ့ ပြပါ၊ export ကို မတားပါနဲ့
- **Export ခလုတ် (အကြီးဆုံး, Violet):** "PNG Download — 1080 × 1080"
  - Format ပြောင်းရင် ခလုတ်စာသားပါ ပြောင်းရမယ်
  - Download လုပ်နေချိန် spinner၊ ပြီးရင် toast

---

## ၄. Templates `/templates`

- Filter: လုပ်ငန်းအမျိုးအစားအလိုက် (စားသောက်ဆိုင် / Online shop / အလှအပ)
  — v1 မှာ filter က UI သီးသန့်၊ v2 မှာ တကယ် filter လုပ်မယ်
- Card တစ်ခုချင်း: Type (Violet စာ), Template name, Headline, Product • Target • Format
- Card အောက် CTA: "ဒီ template နဲ့ ဖန်တီးပါ → /create"
- Template copy တွေကို native reviewer စစ်ပြီးမှ သုံးမယ်လို့ note ထား

## ၅. Brands `/brands` + Designs `/designs` (v1: Placeholder UI)

- Heading + ရှင်းတဲ့ စာသား: "Supabase ချိတ်ပြီးမှ အလုပ်လုပ်မယ် (Dev 1)"
- Empty state illustration / card + " /create ကို သွားပါ" CTA
- v2 မှာ: Brands = list + create form + logo upload;
  Designs = grid of saved PNGs + "ပြန်ဖွင့်" + "ဖျက်" (confirm modal နဲ့)

## ၆. Login / Signup / Dashboard (Supabase ချိတ်ပြီးမှ)

- Login form: email + password, error ရှိရင် မြန်မာလို ရှင်းတဲ့ message
  ("ဒီ sign-in link က အလုပ်မလုပ်ပါ — သက်တမ်းကုန်သွားနိုင်ပါတယ်")
- Signup form: email + password + "စာလုံးပေါင်း" မဟုတ်၊ terms သဘောတူချက်
- Supabase မချိတ်ရသေးရင်: "Supabase is not connected yet" အဝါရောင် notice —
  crash မဖြစ်ရ၊ setup steps ကို ပြပါ
- Dashboard: "You are logged in" + email + Logout + cards:
  Create a promo → /create, My brands, My designs
- Logged-out user က /dashboard ကို ဝင်ရင် /login?next=/dashboard ကို ပြန်ပို့မယ်

---

## ၇. Components List (Dev 2 ဆောက်မယ့် အပိုင်းတွေ)

- `Button` — primary (Violet), secondary (outline Violet), ghost
- `Input`, `Select`, `Textarea` — Lilac border, Violet focus ring
- `Card` — rounded-2xl, Lilac border
- `Stepper` — Step 1/2/3 indicator
- `CanvasPreview` — format အတိုင်း canvas ပြမယ်
- `LayerList` — Background / Text / Logo အစဉ်
- `QAChecklist` — checkbox + API warning box
- `Toast` — success / error message
- `Modal` — confirm delete (v2), template preview (v2)

## ၈. Mobile UI စည်းမျဉ်း

- ၁ column ပဲ၊ form တွေ full width
- Preview ကို အပေါ်မှာ sticky မထားရ — scroll လုပ်ရင် form ကို ဖုံးသွားလို့ပါ
- ခလုတ်တွေ အနည်းဆုံး 44px အမြင့်၊ slider ကို လက်နဲ့ ဆွဲရလွယ်အောင် ကျယ်ကျယ်
- Font size အနည်းဆုံး 16px (phone keyboard zoom မဖြစ်အောင်)
- PNG export ကို phone မှာ download လုပ်လို့ရကြောင်း စမ်းရမယ်

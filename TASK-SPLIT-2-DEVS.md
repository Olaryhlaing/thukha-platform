# ThuKha Platform — Developer ၂ ယောက်အတွက် Task ခွဲဝေမှု

> အခြေခံ: 2026-10-28 framework (fresh build, old code မသုံး)
> ရည်မှန်းချက်: Dec 1–7 MVP — ၁ မိနစ်အတွင်း မြန်မာစာမှန်တဲ့ promo post
> အရောင်: Violet #5946ED (CTA) + Lilac #A78BFA (accent) အများဆုံး၊ Indigo စာသားအတွက်ပဲ
> မှတ်ချက်: အောက်က Dev 1 / Dev 2 သည် role အလိုက် ခွဲထားတာပါ။ နာမည်ကို
> team နဲ့ ကိုက်အောင် လဲလို့ရပါတယ် — အကြံပြုထားတဲ့ နာမည်မှာ
> Dev 1 = Olary (Product Architecture & Full-Stack Lead),
> Dev 2 = Saw Thurizza (Frontend & Canvas UI) ဖြစ်ပါတယ်။

---

## Dev 1 — System / Backend / AI (Lead)

**တာဝန်:** အခြေခံစနစ်၊ database၊ API၊ AI ချိတ်ဆက်မှု၊ deploy

### လုပ်ရမယ့် Tasks

1. **Repo + အခြေခံ**
   - Fresh Next.js scaffold ကို ထိန်းသိမ်း၊ `layout.tsx`၊ fonts
     (Noto Sans Myanmar + Inter)၊ Violet/Lilac theme tokens
   - `.env.example` — Supabase + server-only AI key (တကယ့် key မထည့်ရ)
   - Vercel deploy + GitHub branch protection / PR review

2. **Supabase — Auth + Database + Storage**
   - Auth: sign up / log in / log out၊ protected pages
   - Tables: `profiles`, `brands`, `designs`, `templates`,
     `generations`, `usage_events`
   - `designs.canvas_json` — design ကို JSON အဖြစ် သိမ်း၊ ပြန်ဖွင့်ရင် အတိုင်းပြန်ရ
   - RLS: ကိုယ့် brand/design ကိုယ်ပဲ မြင်ရ
   - Storage buckets: `logos`, `uploads`, `generated`, `exports`

3. **API Routes (key က server မှာပဲ)**
   - `POST /api/generate-background`
     - Prompt hard rule: no text, no letters, no logo
     - ပုံမှာ စာပါသလား auto-check၊ ပါရင် ပြန်ထုတ်
     - Model fallback chain + `usage_events` မှာ log
   - `POST /api/generate-caption`
     - Burmese Unicode သီးသန့်၊ Zawgyi → Unicode၊ Thai version
     - ၃ မျိုး ပေးမယ်၊ user ပြင်လို့ရ
   - `POST /api/qa-check` (ဖြစ်နိုင်ရင်)
     - စာလုံးပေါင်း၊ ဈေး/ဖုန်း ကိုက်မှု၊ stereotype စစ်

4. **Export + Data Format ပိုင်ရှင်**
   - Canvas JSON format ကို သတ်မှတ်ပြီး document လုပ်မယ် (အောက် Contract ကြည့်)
   - PNG export: 1080×1080, 1080×1920, 1200×630 တိကျဖို့ စစ်မယ်
   - Cost / latency log — beta မှာ စျေးတွက်လို့ရအောင်

### Dev 1 ပိုင်တဲ့ Files (Dev 2 က ဒီထဲကို review မပါဘဲ မပြင်ရ)

- `src/app/layout.tsx`, `src/app/globals.css`
- `src/lib/supabase/*`, `src/lib/ai/*`, `src/lib/export*`
- `src/app/api/*`
- Database SQL files, `.env.example`, deploy config

### Done ဖြစ်ကြောင်း

- Log in လုပ်ပြီး ကိုယ့် design ကိုယ်ပဲ မြင်ရတယ်
- Topic ထည့်ရင် စာမပါတဲ့ background ရတယ်၊ usage log တက်တယ်
- Caption ၃ မျိုး ရတယ်၊ key တွေ browser မှာ မပေါ်ဘူး

---

## Dev 2 — Frontend / Editor / Templates

**တာဝန်:** မြင်ရတဲ့ UI အားလုံး၊ editor၊ templates၊ Burmese typography

### လုပ်ရမယ့် Tasks

1. **Pages UI**
   - `/` Home — Violet→Lilac hero, tagline, workflow, templates အကျဉ်း
   - `/create` — အဓိက page: brief + editor + preview + export
   - `/templates` — လုပ်ငန်းအမျိုးအစားအလိုက် preset
   - `/brands`, `/designs` — Dev 1 API ကို သုံးပြီး UI ပဲ လုပ်မယ်
   - Mobile-first၊ phone မှာ editor သုံးလို့ရရမယ်

2. **Canvas Editor (အဓိကဆုံး)**
   - Layer ၃ ခု သီးခြား: background / Burmese text / logo
   - Text: ရွှေ့၊ အရွယ်ပြောင်း၊ လှည့်၊ font size / colour / alignment ပြောင်း
   - Logo: မူရင်းအတိုင်း တင်၊ မဆန့်အောင် ထား၊ AI ပြန်မဆွဲဘူး
   - Burmese test strings: stacked စာလုံး၊ ဈေးနှုန်း၊ Thai + English ရောတာ
     စမ်းလို့ရတဲ့ ခလုတ်တွေ ထည့်မယ်
   - Preview = export PNG အတိုင်း ဖြစ်ရမယ် (screen နဲ့ file ကွာလို့ မရဘူး)

3. **Brief Builder + Caption + QA UI**
   - Brief form: လုပ်ငန်းအမျိုးအစား၊ product၊ target၊ goal၊ channel၊ budget
   - Caption draft ကို ပြင်လို့ရ၊ copy လုပ်လို့ရ
   - QA checklist UI: စာလုံးပေါင်း၊ ဈေး/ဖုန်း၊ logo မူရင်း၊ stereotype

4. **Design System**
   - Violet CTA၊ Lilac accent/glow၊ rounded cards၊ whitespace သန့်သန့်
   - Burmese စာအတွက် line-height 1.5–1.7၊ heading 600–700
   - Lilac/teal ကို body text အဖြစ် မသုံးရ

### Dev 2 ပိုင်တဲ့ Files (Dev 1 က ဒီထဲကို review မပါဘဲ မပြင်ရ)

- `src/app/page.tsx`, `src/app/create/*`, `src/app/templates/*`
- `src/app/brands/*`, `src/app/designs/*` (UI အပိုင်းပဲ)
- `src/components/editor/*`, `src/components/ui/*`

### Done ဖြစ်ကြောင်း

- Login မလိုဘဲ `/create` မှာ brief → headline ပြင် → logo တင် → PNG download ရတယ်
- Burmese test strings အားလုံး ပျက်မသွားဘူး၊ မညှပ်ဘူး
- Phone မှာ editor သုံးလို့ရတယ်

---

## နှစ်ယောက် ဆုံရမယ့် Contract (အရေးကြီးဆုံး)

### 1. Canvas JSON Format — Dev 1 သတ်မှတ်၊ Dev 2 အဲဒီအတိုင်း သုံး

```json
{
  "format": "1080x1080",
  "layers": [
    { "id": "bg-1", "type": "background", "src": "..." },
    { "id": "text-1", "type": "text", "text": "…",
      "x": 540, "y": 300, "fontSize": 84, "color": "#ffffff",
      "align": "center", "rotation": 0 },
    { "id": "logo-1", "type": "logo", "src": "...",
      "x": 540, "y": 80, "width": 200, "rotation": 0 }
  ]
}
```

### 2. API Contract — Dev 2 က ဒီအတိုင်း ခေါ်မယ်

- `POST /api/generate-background` — input: `{ brief }` →
  output: `{ imageUrl, generationId }`
- `POST /api/generate-caption` — input: `{ brief }` →
  output: `{ options: [string, string, string] }`
- Error ဖြစ်ရင်: `{ error: "ရှင်းတဲ့ မြန်မာ message" }` + retry ခလုတ်

### 3. Branch + Merge စည်းမျဉ်း

- Dev 1: branch `system/*`၊ Dev 2: branch `ui/*`
- ကိုယ့်ပိုင်တဲ့ file မဟုတ်ရင် PR review မပါဘဲ merge မလုပ်ရ
- နေ့စဉ် 30 မိနစ် sync: လုပ်ပြီး / လုပ်နေတာ / ပိတ်နေတာ
- တစ်ယောက်ယောက် ပိတ်နေရင် အဲဒါကို အရင်ဖြေရှင်းမယ်

### 4. မထပ်အောင် ခွဲထားတာ

| Dev 1 လုံးဝ မလုပ်ရ | Dev 2 လုံးဝ မလုပ်ရ |
|---|---|
| UI styling, editor layout | API key, RLS policy, DB schema |
| Template copy အလှဆင် | Cost / usage log logic |
| Burmese font UI စမ်းတာ | Deploy / env config |

---

## Timeline (Framework အတိုင်း)

**Prototype Nov 1–7**
- Dev 1: Auth + DB + RLS + background API (placeholder အရင်၊ AI နောက်)
- Dev 2: Home + `/create` UI + editor v1 (move/resize) + PNG export

**Prototype Nov 8–14 — ချိတ်ဆက်ပတ်**
- နှစ်ယောက်: API + editor ချိတ်မယ်၊ canvas_json သိမ်း/ပြန်ဖွင့် စမ်းမယ်
- Dev 2: templates ၃ ခု၊ Dev 1: caption API + usage log
- Demo video အတွက် Before/After နမူနာ ၁ ခု

**Closed Beta Nov 15–24**
- Dev 1: QA API၊ fallback၊ cost tracking၊ product photo background removal
- Dev 2: QA checklist UI၊ phone စမ်းသပ်၊ Burmese QA ပြင်ဆင်ချက်

**Launch Readiness Nov 25–30 — Scope Freeze**
- Feature အသစ် မထည့်ရ၊ bug ပြင်ပဲ၊ payment/support စမ်းမယ်

**v1 မှာ မပါဘူး (နှစ်ယောက်လုံး မလုပ်ရ)**
General chat၊ video generation၊ 3D၊ Facebook auto-post၊ payment အပြည့်အစုံ

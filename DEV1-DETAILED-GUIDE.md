# Developer One — အစအဆုံး Detailed Guide (ThuKha Platform)

> Role: System / Backend / AI (Lead)
> Fresh build — old code မသုံး၊ folder: `~/workspace/thukha-platform/`
> Branch: `system/*` (Dev 2 branch `ui/*` နဲ့ မရောရ)
> ရည်မှန်းချက်: Dec 1–7 MVP — ၁ မိနစ်အတွင်း မြန်မာစာမှန်တဲ့ promo post
> အရောင်: Violet #5946ED + Lilac #A78BFA အများဆုံး၊ Indigo စာသားအတွက်ပဲ
> အဓိက စည်းမျဉ်း: AI key နဲ့ service_role key ကို browser မှာ ဘယ်တော့မှ မပေါ်စေရ။
> မြန်မာစာကို AI ပုံထဲမှာ မှန်မယ်လို့ ဘယ်တော့မှ ကတိမပေးရ — စာက သီးခြား layer ပဲ။

---

## အဆင့် ၀ — စတင်ခင် ပြင်ဆင်မှု (Day 0)

1. Node.js 20+ ရှိမရှိ စစ်ပါ: `node -v`, `npm -v`
2. Fresh scaffold ကို စစ်ပါ — `~/workspace/thukha-platform/` မှာ
   `package.json` (name: `thukha-platform`, Next 16), `src/app/`,
   `node_modules/` ရှိနေရမယ်။ မရှိရင် scaffold ကို အရင်ပြန်ယူပါ။
3. Git branch အသစ် ဖွင့်ပါ:
   ```bash
   cd ~/workspace/thukha-platform
   git init -b main  # မရှိသေးရင်သာ
   git checkout -b system/foundation
   ```
4. `.gitignore` မှာ ဒါတွေ ပါရမယ်: `node_modules`, `.next`, `.env.local`
5. Dev 2 နဲ့ 30 မိနစ် meeting လုပ်ပါ — အောက်က အချက် ၃ ခုကို သဘောတူပြီးမှ
   code စပါ:
   - Canvas JSON format (အဆင့် ၄)
   - API input/output (အဆင့် ၆–၇)
   - Branch + PR စည်းမျဉ်း (Dev 1 file ကို Dev 2 review မပါဘဲ မပြင်၊ အပြန်အလှန်လည်း ထို့အတူ)

**Day 0 Done စစ်နည်း:** `npm run dev` ဖွင့်လို့ ရတယ်၊ branch `system/*` ပေါ်မှာ ရှိတယ်၊
meeting notes ၃ ခု သဘောတူပြီးပြီ။

---

## အဆင့် ၁ — Foundation: Layout, Font, Theme (Nov 1–2)

1. `src/app/layout.tsx` ကို ပြင်ပါ:
   - `lang="my"`, title: `ThuKha Platform — သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ်`
   - Fonts: `Inter` (Latin) + `Noto_Sans_Myanmar` (Myanmar, weight 400/600/700)
     ကို `next/font/google` နဲ့ ယူပါ။ Font တွေ download မရရင် build မှာ
     ချက်ချင်း သိရမယ် — အဲဒါကို နောက်မှ မထားပါနဲ့။
2. `src/app/globals.css` မှာ Tailwind theme tokens ထည့်ပါ:
   ```css
   @theme {
     --color-thukha-indigo: #10113d;
     --color-thukha-violet: #5946ed;
     --color-thukha-lilac: #a78bfa;
     --color-thukha-blue: #2f80ed;
     --color-thukha-teal: #22c7a9;
     --color-thukha-mist: #f6f7fb;
   }
   ```
   - Body: background mist/white, text indigo, line-height 1.6
   - Lilac/teal ကို body text အဖြစ် မသုံးရ — accent/glow ပဲ။
3. `public/thukha-logo.png` နဲ့ `public/thukha-splash.png` ကို
   user တင်ပေးထားတဲ့ မူရင်း logo files တွေကနေ ကူးပါ
   (old app folder ကနေ မကူးရ — မူရင်း upload ကနေပဲ ကူးပါ)။
4. `.env.example` ဖန်တီးပါ — တကယ့် key တစ်လုံးမှ မပါရ:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   AI_API_KEY=
   AI_BACKGROUND_MODEL=
   AI_TEXT_MODEL=
   AI_DAILY_LIMIT=20
   ```

**စစ်နည်း:** `npm run build` + `npm run lint` အောင်ရမယ်၊ home page မှာ
logo + Violet→Lilac hero ပေါ်ရမယ်။

---

## အဆင့် ၂ — Supabase Project ဖန်တီးခြင်း (Nov 2–3)

> ဒါက Dev 1 ကိုယ်တိုင် Supabase login နဲ့ လုပ်ရမယ့် အပိုင်း။
> Muse က account ဖွင့်/ဖန်တီးပေးလို့ မရဘူး။

1. supabase.com မှာ project အသစ် ဖွင့်ပါ:
   - Region: **Singapore** (Myanmar/Thailand user တွေနဲ့ အနီးဆုံး)
   - Database password ကို password manager မှာ သိမ်းပါ၊ chat/git မှာ မရေးပါနဲ့။
2. Project Settings → API ကနေ ကူးပါ:
   - Project URL → `.env.local` မှာ `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (server-only၊
     `NEXT_PUBLIC_` prefix လုံးဝ မတပ်ရ)
3. Auth settings:
   - Development မှာ: Confirm email = **OFF** (စမ်းရလွယ်အောင်)
   - Site URL: `http://localhost:3000`
   - Redirect URLs မှာ ထည့်ပါ: `http://localhost:3000/auth/callback`
   - Production ရောက်မှ Site URL ကို Vercel domain နဲ့ လဲပါ၊ Confirm email ကို ON ပြန်လုပ်ပါ။
4. `npm install @supabase/ssr @supabase/supabase-js` လုပ်ပါ။
5. Clients ၃ ခု ရေးပါ (files ပိုင်တာ Dev 1):
   - `src/lib/supabase/client.ts` — browser client၊ env မရှိရင် null ပြန်ပြီး
     crash မဖြစ်ရ
   - `src/lib/supabase/server.ts` — server client (cookies သုံး)
   - `src/lib/supabase/proxy.ts` + `src/proxy.ts` — session refresh +
     protected route logic (Next 16 proxy convention)
   - Cache Components သုံးရင် cookies/searchParams ဖတ်တဲ့ page တွေမှာ
     `export const instant = false` ထည့်ဖို့ သတိထားပါ။
6. Auth routes:
   - `/login`, `/signup` — form UI က Dev 2 လုပ်မယ်၊ Dev 1 က
     submit logic + error handling + redirect (`?next=`) ကို ပေးမယ်
   - `/auth/callback/route.ts` — email confirmation code ကို session နဲ့ လဲမယ်
   - Logout button — session ကို ရှင်းပြီး `/login` ကို ပြန်ပို့မယ်
   - Env မရှိရင် "Supabase is not connected yet" notice ပြမယ်၊ crash မဖြစ်စေရ။

**စစ်နည်း (အဆင့်လိုက်):**
- [ ] Sign up → dashboard ရောက်တယ်
- [ ] Log out → logged-out `/dashboard` က `/login?next=/dashboard` ကို 307 ပြန်ပို့တယ်
- [ ] Log in ပြန်လုပ်ပြီး dashboard ပြန်ရောက်တယ်
- [ ] `.env.local` ကို git status မှာ မပေါ်ဘူး (ignored ဖြစ်တယ်)

---

## အဆင့် ၃ — Database + RLS + Storage (Nov 3–5)

Supabase → SQL Editor မှာ အောက်ပါ SQL ကို အစဉ်လိုက် run ပါ။
Table တစ်ခုချင်း run ပြီးတိုင်း error ရှိမရှိ စစ်ပါ။

### 3.1 Tables

```sql
-- profiles: auth user တစ်ယောက်ချင်းစီရဲ့ profile
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz default now()
);

-- brands: လုပ်ငန်းတစ်ခု = brand တစ်ခု
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  business_type text,
  brand_colors jsonb default '{}'::jsonb,
  logo_url text,
  created_at timestamptz default now()
);

-- designs: canvas_json ကို သိမ်းမယ် — ပြန်ဖွင့်ရင် အတိုင်းပြန်ရမယ်
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  brand_id uuid references public.brands (id) on delete set null,
  title text,
  format text not null default '1080x1080',
  canvas_json jsonb not null default '{}'::jsonb,
  export_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- templates: လုပ်ငန်းအမျိုးအစားအလိုက် preset
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  business_type text not null,
  name text not null,
  canvas_json jsonb not null default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- generations: AI တစ်ခါ ထုတ်တိုင်း တစ်ကြောင်း
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null, -- 'background' | 'caption' | 'qa'
  model text,
  prompt text,
  result_url text,
  status text not null default 'ok', -- ok | failed | regenerated
  cost_estimate numeric,
  latency_ms integer,
  created_at timestamptz default now()
);

-- usage_events: limit + cost တွက်ဖို့ အဓိက table
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  created_at timestamptz default now()
);
```

### 3.2 RLS — ဒါကို ကျော်လို့ လုံးဝ မရဘူး

```sql
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.designs enable row level security;
alter table public.generations enable row level security;
alter table public.usage_events enable row level security;

-- ကိုယ့် data ကိုယ်ပဲ: select / insert / update / delete အားလုံး owner_id = auth.uid()
create policy "own rows" on public.brands
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own rows" on public.designs
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own rows" on public.generations
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own rows" on public.usage_events
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- templates ကို လူတိုင်း ဖတ်လို့ရတယ် (active ဖြစ်တာပဲ)
create policy "public templates read" on public.templates
  for select using (is_active = true);
```

### 3.3 Storage Buckets

Supabase → Storage မှာ buckets ၄ ခု ဖန်တီးပါ (private):
`logos`, `uploads`, `generated`, `exports`

Policy အခြေခံ (bucket တစ်ခုချင်းစီအတွက်၊ folder = owner_id):
- Upload / read / delete: ကိုယ့် folder (`owner_id/…`) ကိုယ်ပဲ
- `generated` နဲ့ `exports` ကို API route (service_role) က ရေးမယ်၊
  browser က တိုက်ရိုက် service_role key နဲ့ ဘယ်တော့မှ မရေးရ။

**စစ်နည်း (RLS Test — မဖြစ်မနေ):**
- [ ] User A login → သူ့ brand/design ပဲ မြင်ရတယ်
- [ ] User B login → A ရဲ့ data ကို query လုပ်ရင် 0 row ပြန်တယ် (error မဟုတ်၊ 0 row)
- [ ] Logged-out user → designs/brands ကို ဖတ်လို့ မရဘူး
- [ ] Logo upload → `logos/<owner_id>/…` မှာ တက်တယ်၊ မူရင်း file အတိုင်း မပျက်ဘူး

---

## အဆင့် ၄ — Canvas JSON Format (Dev 1 သတ်မှတ်၊ Dev 2 လိုက်နာ)

ဒါက နှစ်ယောက် ဆုံတဲ့ အရေးကြီးဆုံး contract ပါ။ Dev 1 က ဒီ format ကို
document လုပ်ပြီး Dev 2 ကို ပေးရမယ်။ Format ပြောင်းရင် နှစ်ယောက် သဘောတူပြီးမှ ပြောင်းပါ။

```json
{
  "version": 1,
  "format": "1080x1080",
  "layers": [
    { "id": "bg-1", "type": "background", "src": "https://…/generated/….png" },
    {
      "id": "text-1", "type": "text",
      "text": "သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ်",
      "x": 540, "y": 300, "fontSize": 84, "color": "#ffffff",
      "align": "center", "rotation": 0
    },
    {
      "id": "logo-1", "type": "logo", "src": "https://…/logos/….png",
      "x": 540, "y": 80, "width": 200, "rotation": 0
    }
  ]
}
```

Validation စည်းမျဉ်း (API နဲ့ editor နှစ်ဖက်လုံး အတူတူ လိုက်နာရ):
- `format` က `1080x1080` | `1080x1920` | `1200x630` ၃ မျိုးထဲက တစ်ခုပဲ
- Layer order အမြဲ: background → text → logo (logo က အပေါ်ဆုံးပဲ)
- Text layer မှာ `fontSize` 24–160 ကြား၊ `color` က hex ပဲ
- Logo layer မှာ aspect ratio ကို ဘယ်တော့မှ မဆန့်ရ — width ပြောင်းရင်
  height ကို ratio အတိုင်း အလိုအလျောက် တွက်ပါ
- Burmese text ကို Unicode ပဲ သိမ်းပါ — Zawgyi ဝင်လာရင် API မှာ
  Unicode ပြောင်းပြီးမှ သိမ်းပါ

**စစ်နည်း:** ဒီ JSON နမူနာကို editor မှာ ဖွင့်ရင် ပုံ အတိုင်းထွက်တယ်၊
သိမ်းပြီး ပြန်ဖွင့်ရင် layer တွေ နေရာ/အရွယ် မပြောင်းဘူး။

---

## အဆင့် ၅ — API Routes: Background (Nov 5–7, Prototype အဓိက)

File: `src/app/api/generate-background/route.ts` (server-only)

### 5.1 Input / Output Contract

Request (Dev 2 က ဒီအတိုင်း ပို့မယ်):
```json
{
  "brief": {
    "businessType": "စားသောက်ဆိုင်",
    "product": "မုန့်ဟင်းခါး",
    "target": "Bangkok ရှိ မြန်မာမိသားစုများ",
    "goal": "ရောင်းအား တိုးရန်",
    "channel": "Facebook post",
    "style": "warm, appetizing, real food photo style"
  },
  "format": "1080x1080"
}
```

Success output:
```json
{ "imageUrl": "https://…/generated/….png", "generationId": "uuid" }
```

Error output (Dev 2 က retry ခလုတ် ပြလို့ရအောင်):
```json
{ "error": "Background ထုတ်လို့ မရသေးပါ။ ထပ်ကြိုးစားပါ။" }
```

### 5.2 Prompt Template — ဒီအတိုင်း အမြဲ ရေးပါ

```
Create a clean marketing background image for a Myanmar {businessType}
promoting {product}, for {target}, goal: {goal}.
Style: {style}, local Myanmar setting, natural light, real photo look.
HARD RULES: absolutely no text, no letters, no words, no numbers,
no logo, no watermark, no signboard text in the image.
Leave clear empty space in the center/lower third for headline text later.
```

- Burmese စကားလုံးကို prompt ထဲမှာ ဘယ်တော့မှ မထည့်ပါနဲ့ — AI က
  မြန်မာစာကို ပုံထဲမှာ မှန်အောင် ရေးလို့ မရလို့ပါ။
- Brand colour ကို prompt မှာ အရောင်အမည်/hex အဖြစ် ထည့်လို့ရတယ်၊
  logo ပုံကိုတော့ AI ကို ဘယ်တော့မှ မပေးရ။

### 5.3 No-Text Auto-Check (မဖြစ်မနေ)

1. ပုံထွက်လာပြီးတိုင်း "စာပါသလား" စစ်ပါ — အဆင့် ၈ QA API နဲ့ တူတဲ့
   check ကို သုံးပါ (image model / OCR / provider ရဲ့ text detection)။
2. စာပါရင်: user ကို အဲဒီပုံကို **မပြပါနဲ့** — အလိုအလျောက် ၁ ကြိမ်
   ပြန်ထုတ်ပါ၊ `generations.status = 'regenerated'` လို့ မှတ်ပါ။
3. ၂ ကြိမ်လုံး စာပါရင်: error ပြန်ပြီး user ကို placeholder gradient
   (Violet/Lilac) နဲ့ ဆက်လုပ်ခွင့်ပေးပါ — app က ရပ်မသွားစေရ။

### 5.4 Fallback Chain + Timeout + Usage Log

- Model 1 ပျက်ရင် / timeout (60 စက္ကန့်) ဖြစ်ရင် Model 2 ကို အလိုအလျောက် ပြောင်းပါ။
  Model 2 လည်း ပျက်ရင် error ပြန်ပါ — user ကို အကြောင်းရင်း ရှင်းရှင်းပြောပါ။
- အောင်သည်ဖြစ်စေ၊ ပျက်သည်ဖြစ်စေ `generations` မှာ တစ်ကြောင်း ရေးပါ:
  `kind='background'`, `model`, `prompt`, `result_url`, `status`,
  `latency_ms`။
- အောင်မြင်တိုင်း `usage_events` မှာ တစ်ကြောင်း ရေးပါ (`kind='background'`)။
- Daily limit: `AI_DAILY_LIMIT` env (default 20) — limit ပြည့်ရင်
  "ဒီနေ့ limit ပြည့်သွားပါပြီ" လို့ ရှင်းရှင်းပြပါ၊ silent fail မလုပ်ပါနဲ့။
- ပုံကို `generated` bucket မှာ သိမ်းပါ၊ public URL ကို ပြန်ပါ။
  Bucket က private ဆိုရင် signed URL / API route ကနေ ပြန်ပေးပါ။

**စစ်နည်း:**
- [ ] Topic ထည့်ရင် စာမပါတဲ့ ပုံ ရတယ်
- [ ] စာပါတဲ့ ပုံ (စမ်းသပ်ဖို့ prompt ကို တမင် စာပါအောင် ရေးပြီး) ဆိုရင် ပြန်ထုတ်တယ်
- [ ] Model ပျက်ရင် fallback ဖြစ်တယ်၊ usage log တက်တယ်
- [ ] API key ကို browser Network tab မှာ ရှာလို့ မရဘူး

---

## အဆင့် ၆ — API Routes: Caption + Headline (Nov 8–10)

File: `src/app/api/generate-caption/route.ts` (server-only)

### 6.1 Input / Output

Request: `{ "brief": { …အဆင့် ၅ အတိုင်း… }, "tone": "friendly" }`
- tone: `friendly` | `premium` | `discount` (Dev 2 က select ပေးမယ်)

Output:
```json
{
  "options": [
    "…Burmese caption 1…",
    "…Burmese caption 2…",
    "…Burmese caption 3…"
  ],
  "thai": "…Thai version (optional)…",
  "hashtags": ["#ThuKha", "#MyanmarBusiness"]
}
```

### 6.2 Prompt စည်းမျဉ်း

- Output က **Burmese Unicode သီးသန့်** ဖြစ်ရမယ် — Zawgyi လုံးဝ မရ။
  Model က Zawgyi ပြန်လာရင် converter နဲ့ Unicode ပြောင်းပြီးမှ ပြန်ပါ။
- Headline က တိုရမယ် (၁–၂ ကြောင်း)၊ caption က ရောင်းဖို့ ရှင်းရမယ်
  (product + အကျိုး + CTA + ဖုန်း/ဈေး မှန်ရမယ်)။
- ရောင်းအား အာမခံတယ်၊ "အကောင်းဆုံး" လို သက်သေမရှိတဲ့ claim မျိုး
  မရေးရ — prompt ထဲမှာ တားပါ။
- ၃ မျိုး ပေးပြီးရင် user က ပြင်လို့ရမယ် — API က fixed text မပေးရ။
- Caption တစ်ခါ ထုတ်တိုင်း `generations` + `usage_events`
  (`kind='caption'`) မှာ log တက်ရမယ်။

### 6.3 Zawgyi → Unicode

- ကိုယ်တိုင် converter မရေးပါနဲ့ — စမ်းသပ်ပြီးသား library
  (ဥပမာ Myanmar Tools / rabbit converter အမျိုးအစား) ကို သုံးပါ။
- Input မှာ Zawgyi နဲ့ Unicode ရောနေရင်: detect လုပ်ပြီး Zawgyi အပိုင်းကို
  Unicode ပြောင်းပါ၊ ပြီးမှ model ကို ပို့ပါ / model output ကို စစ်ပါ။
- Test strings (Dev 2 နဲ့ အတူတူ သုံးပါ):
  - Stacked စာလုံး၊ ဈေးနှုန်း `၅၉,၀၀၀ ကျပ်`၊ Thai + English ရောတာ

**စစ်နည်း:**
- [ ] Caption ၃ မျိုး ရတယ်၊ ၃ မျိုးလုံး Unicode မှန်တယ်
- [ ] Zawgyi input ထည့်ရင် Unicode output ထွက်တယ်
- [ ] ဈေး/ဖုန်း မှားရင် QA က သတိပေးတယ် (အဆင့် ၇)

---

## အဆင့် ၇ — API Routes: QA Check (Nov 10–12, Beta အတွက် အခြေခံ)

File: `src/app/api/qa-check/route.ts`

Input: `{ "headline": "…", "caption": "…", "price": "…", "phone": "…", "imageUrl": "…" }`

Output နမူနာ:
```json
{
  "warnings": [
    { "code": "price_mismatch", "message": "Headline ဈေးနဲ့ caption ဈေး မတူပါ" },
    { "code": "text_in_image", "message": "ပုံမှာ စာပါဝင်နေပါတယ်" }
  ],
  "passed": false
}
```

စစ်ရမယ့် အချက်တွေ (တစ်ခုချင်း function ခွဲရေးပါ):
1. **စာလုံးပေါင်း** — Burmese spell check / နမူနာ list နဲ့ စစ်၊
   သံသယရှိရင် warning ပဲ ပေး၊ block မလုပ်ရ
2. **ဈေး/ဖုန်း ကိုက်မှု** — headline, caption, price field ၃ ခု တူမတူ စစ်
3. **ပုံမှာ စာ** — အဆင့် ၅.၃ check ကို ပြန်သုံး
4. **Stereotype / ဒေသခံ မှားမှု** — prompt + manual review list:
   အဝတ်အစား၊ ပွဲတော်၊ ထုတ်ကုန်ထုပ်ပိုးမှု မှားနေသလား
5. **Logo မူရင်း** — logo file ကို AI ပြန်မဆွဲထားကြောင်း (hash / file မူရင်း စစ်)

QA က **တားတဲ့ gate မဟုတ်ဘူး** — warning ပြပြီး user က ဆက်လုပ်/
ပြင်လို့ ရအောင် လုပ်ပါ။ `warnings` ကို export လုပ်ခါနီးမှာ ပြပါ။

---

## အဆင့် ၈ — Export + Product Photo (Nov 12–14)

### 8.1 PNG Export (Dev 1 ပိုင်ရှင်၊ Dev 2 UI နဲ့ ချိတ်)

- Export sizes: 1080×1080 (post), 1080×1920 (story), 1200×630 (cover/card)
- File name: `thukha-{format}-{designId}.png`
- Export လုပ်တဲ့ PNG က preview အတိုင်း ဖြစ်ရမယ် — screen မှာ လှပြီး
  file မှာ ပျက်နေလို့ မရဘူး။ ဒါကို Dev 1 + Dev 2 နှစ်ယောက် အတူတူ စစ်ပါ:
  - Burmese စာ ကြည်တယ်၊ မညှပ်ဘူး
  - Logo မဆန့်ဘူး၊ အရောင် မပြောင်းဘူး
  - Text layer က background ပုံနဲ့ မရောဘူး
- Export လုပ်တိုင်း `designs.export_url` ကို update လုပ်ပါ
  (ဖြစ်နိုင်ရင် `exports` bucket မှာ သိမ်းပါ)။

### 8.2 Product Photo Mode (Beta အတွက်၊ Nov 15–24 မှာ အပြည့်လုပ်)

- User က တကယ့် product ဓာတ်ပုံ တင်လာရင်:
  1. Background removal လုပ်ပါ (library / API သုံးပါ)
  2. Product ကို ဘယ်တော့မှ ပြန်မဆွဲပါနဲ့၊ ပုံပျက်မသွားစေရ
  3. သန့်ရှင်းတဲ့ background (Violet/Lilac gradient ဒါမှမဟုတ် အဖြူ) ပေါ် တင်ပါ
  4. ရလဒ်ကို `uploads` / `generated` မှာ သိမ်းပါ
- ဒါက စားသောက်ဆိုင် / online shop အတွက် အကြီးဆုံး အားသာချက်ပါ —
  Walone လို redraw လုပ်တာ မဟုတ်ဘူးဆိုတာ demo မှာ ပြပါ။

---

## အဆင့် ၉ — Integration ပတ် (Nov 8–14) — Dev 2 နဲ့ ဆုံရမယ့် အပတ်

1. **Nov 8:** Dev 1 က API contract document + test API URLs ကို Dev 2 ကို ပေးပါ။
   Dev 2 က mock data နဲ့ အရင် ချိတ်ထားတဲ့ UI ကို အစစ်နဲ့ လဲပါ။
2. **Nov 10:** Canvas JSON သိမ်း/ပြန်ဖွင့် end-to-end စမ်းပါ:
   - Create → save → designs list → ပြန်ဖွင့် → layer တွေ အတိုင်းပြန်ရလား
3. **Nov 12:** Auth + RLS ပြန်စစ်ပါ (အဆင့် ၃.၃ test တွေ ပြန်လုပ်)။
4. **Nov 14:** Demo အတွက် Before/After နမူနာ ၁ ခု လုပ်ပါ:
   - Before: မူရင်း product ဓာတ်ပုံ / စာမပါတဲ့ draft
   - After: ThuKha နဲ့ လုပ်ထားတဲ့ finished PNG + caption
   - Demo video ကို Phone Pyae Naing (Growth) က ရိုက်ဖို့ ပေးပါ။

**Integration Done စစ်နည်း:**
- [ ] Teammate တစ်ယောက် (Dev 1/Dev 2 မဟုတ်သူ) က အကူအညီမပါဘဲ
  brief → background → headline ပြင် → logo တင် → PNG download လုပ်နိုင်တယ်
- [ ] `npm run build` + `npm run lint` အောင်တယ်
- [ ] Production smoke: `/` နဲ့ `/create` 200 ပြန်တယ်

---

## အဆင့် ၁၀ — Closed Beta (Nov 15–24)

Dev 1 လုပ်ရမယ့် အလုပ်တွေ:
1. **Usage / Cost Dashboard query** — Supabase SQL နဲ့ နေ့စဉ် စစ်ပါ:
   ```sql
   select kind, count(*), date_trunc('day', created_at) as day
   from public.usage_events
   group by kind, day order by day desc;
   ```
   - Generation တစ်ခုချင်းရဲ့ cost ခန့်မှန်း + margin ကို sheet မှာ မှတ်ပါ။
     Pricing ကို beta willingness-to-pay နဲ့ အတည်ပြုပြီးမှ ဆုံးဖြတ်ပါ —
     အရင် deck စျေး (59,000 / 149,000 / 369,000 MMK) ကို
     အတည်လို့ မမှတ်ပါနဲ့၊ hypothesis ပဲလို့ ထားပါ။
2. **Latency / Failure watch** — `generations` မှာ `status='failed'` များလာရင်
   fallback model ကို စစ်ပါ၊ timeout ကို ချိန်ပါ။
3. **Top failure cases ပြင်ပါ** — beta user 20–30 ယောက်ရဲ့ feedback ထဲက
   အများဆုံး ပျက်တဲ့ ၃ ခုကို အရင်ပြင်ပါ (feature အသစ် မထည့်ရ)။
4. **Native reviewer loop** — Burmese copy/style နမူနာတွေကို native reviewer
   စစ်ပြီးမှ template ထဲ ထည့်ပါ။ Review မပြီးတဲ့ copy ကို production
   template အဖြစ် မသုံးပါနဲ့။
5. **Product photo mode အပြည့်အစုံ** (အဆင့် ၈.၂) ကို beta မှာ စမ်းပါ။

---

## အဆင့် ၁၁ — Launch Readiness (Nov 25–30) — Scope Freeze

- [ ] **Feature အသစ် လုံးဝ မထည့်ရ** — bug ပြင်ပဲ လုပ်ပါ
- [ ] Payment test — beta မှာ ပေးချေမှု စမ်းသပ်ပါ (KBPay / WavePay /
  PromptPay ကို brand guide အရ စဉ်းစားပါ၊ Stripe ပဲ အားကိုးမနေပါနဲ့)
- [ ] Support flow — user က error တင်ရင် ဘယ်ကို ဆက်သွယ်ရမလဲ၊
  ဘယ်သူ ဖြေမလဲ သတ်မှတ်ပါ
- [ ] Terms / Privacy pages — public route အဖြစ် ရှိရမယ်
- [ ] Tutorial — ၁ မိနစ် demo / အဆင့်လိုက် guide (Burmese အဓိက)
- [ ] Incident rollback checklist:
  - Vercel မှာ အရင် deployment ကို rollback လုပ်နည်းကို စမ်းထားပါ
  - AI model ပျက်ရင် fallback + placeholder mode ကို ဖွင့်နည်း
  - Supabase down ဖြစ်ရင် `/create` က login မလိုဘဲ ဆက်သုံးလို့ရအောင်
    (prototype mode) ထားပါ
- [ ] Env check — production `.env` မှာ service_role / AI key တွေ မှန်တယ်၊
  `NEXT_PUBLIC_` နဲ့ မှားမပါဘူး၊ `.env.local` git မှာ မပါဘူး

---

## အဆင့် ၁၂ — Public MVP (Dec 1–7) + အပြီးသတ် Checklist

- [ ] Limited public release — onboarding webinar / demo လုပ်ပါ
- [ ] Daily quality watch — နေ့စဉ် generation success rate၊
  Burmese text correction rate၊ onboarding completion ကို စစ်ပါ
- [ ] Retention / Economics မှတ်တမ်း — 7/30-day active၊ repeat exports၊
  revenue per account၊ generation cost၊ churn ကို Dec ကတည်းက မှတ်ပါ
  (March 2027 revenue operations အတွက် လိုလို့ပါ)
- [ ] Known-issues list ရေးပါ + နောက် sprint Top 3 ကို သတ်မှတ်ပါ

---

## Dev 1 အတွက် အမြဲတမ်း စည်းမျဉ်း (Do / Don't)

**လုပ်ပါ:**
- Key တွေ server-only ထားပါ၊ env နဲ့ gitignore စစ်ပါ
- တစ်ခု ပြီးတိုင်း `npm run build` + `npm run lint` လုပ်ပါ
- API ပြောင်းတိုင်း Dev 2 ကို contract document update ပေးပါ
- Usage/cost ကို log မပါဘဲ generation ဘယ်တော့မှ မထုတ်ပါနဲ့

**မလုပ်ပါနဲ့:**
- UI styling / editor layout ကို Dev 2 review မပါဘဲ မပြင်ပါနဲ့
- မြန်မာစာကို AI ပုံထဲမှာ မှန်မယ်လို့ ကတိမပေးပါနဲ့
- General chat / video / 3D / document agent ကို v1 မှာ မထည့်ပါနဲ့
- တကယ့် key / password ကို chat, git, screenshot မှာ မပြပါနဲ့
- Pricing ကို beta မပြီးခင် အတည်လို့ မကြေညာပါနဲ့

---

## Daily Sync Template (Dev 1 က နေ့စဉ် ဖြည့်ပါ)

- လုပ်ပြီး: …
- လုပ်နေတာ: …
- ပိတ်နေတာ / Dev 2 ကို လိုတာ: …
- ဒီနေ့ merge လုပ်မယ့် PR: `system/…`
- Usage/cost မနေ့က: background … ကြိမ်၊ caption … ကြိမ်၊ failed … ကြိမ်

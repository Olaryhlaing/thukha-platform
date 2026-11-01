# ThuKha Platform — Vercel + Supabase မှာ တင်ပြီး Run လုပ်နည်း

> အရေးကြီး: Vercel / Supabase account ဖွင့်တာ၊ GitHub push လုပ်တာ၊
> Vercel မှာ Deploy ခလုတ်နှိပ်တာတွေကို Olary ကိုယ်တိုင် လုပ်ရမယ်။
> Muse က Olary ရဲ့ account တွေကို ဝင်လို့ မရဘူး၊ push / deploy လုပ်မပေးဘူး။
> ဒီဖိုင်က လုပ်ရမယ့် အဆင့်တွေ အကုန်လုံးကို အစအဆုံး ပေးထားတာပါ။

## လက်ရှိ အခြေအနေ (ရိုးရိုးသားသား ပြောရရင်)

- ဒီ app က Vercel မှာ **ဒီနေ့တင် run လို့ရတယ်** — Free Cloudflare သုံးရင်
  လိုတာက Cloudflare Account ID + API token ၂ ခုပဲ (`GEMINI_API_KEY` မလိုဘူး)။
  Gemini သုံးမှသာ key + billing လိုတယ် (Gemini image free tier limit က 0 ပါ)။
- Supabase က အခု **တကယ် ချိတ်ထားပြီ**: `/login` / `/signup` နဲ့ login လုပ်လို့ရတယ်၊
  login ထားရင် token က Supabase `token_balances` table ထဲက server ဘက်က ဖြတ်တယ်၊
  Brands / Designs ကို Supabase ထဲ သိမ်းတယ်။ Guest (login မလုပ်ဘဲ) သုံးရင်
  token / Brands / Designs က browser (localStorage) ထဲမှာပဲ ရှိတယ်။
- ပုံ file ကိုယ်တိုင်ကို Supabase Storage ထဲ မသိမ်းသေးဘူး — Designs က
  prompt / channel / format ပဲ သိမ်းထားတယ်။ Storage က နောက်အဆင့်ပါ။
- PWA ဖိုင်တွေ (manifest / service worker / icon) က cancelled ဖြစ်လို့
  2026-11-01 မှာ folder ထဲက ဖျက်ပြီးပြီ။

## အဆင့် ၀ — ကိုယ့်ကွန်ပျူတာမှာ စစ်

```bash
cd thukha-platform
npm run build
npm run lint
```

နှစ်ခုလုံး အောင်မှ ဆက်လုပ်ပါ။ မအောင်ရင် Deploy တင်လည်း fail မယ်။

## အဆင့် ၁ — GitHub ကို push လုပ်ပါ

```bash
git status
git add -A
git commit -m "Deploy ready: Vercel + Supabase"
git push
```

စစ်ရမယ့်အချက်တွေ:
- `git status` မှာ `.env.local` ပါမနေရဘူး (`.gitignore` က block ထားပြီးသား)။
- `.env.example` ထဲမှာ key အစစ် မပါရဘူး — `GEMINI_API_KEY=` လို့ ဗလာပဲ ရှိရမယ်။
  2026-10-30 မှာ key အစစ် တစ်ခု `.env.example` ထဲ ရောက်ဖူးလို့ အဲဒီ key ကို
  AI Studio မှာ ဖျက်ပြီးမှ အသစ်နဲ့ ဆက်လုပ်ပါ။
- PWA ဖိုင်တွေ ဖျက်ပြီးပြီ၊ deploy မှာ မပါတော့ဘူး။

## အဆင့် ၂ — Supabase project လုပ်ပါ

1. [Supabase](https://supabase.com/dashboard) မှာ Sign in → **New project**။
2. Name: `thukha-platform` (ကြိုက်တာ ပေးလို့ရတယ်)၊
   **Region: Singapore** ကို ရွေးပါ (Myanmar / Thailand နဲ့ အနီးဆုံး)၊
   Database password ကို သေချာ သိမ်းထားပါ။
3. Project တည်ဆောက်ပြီးရင် ဘယ်ဘက် menu က **SQL Editor → New query** မှာ
   ဒီ repo ထဲက `supabase/schema.sql` ဖိုင်တစ်ခုလုံးကို paste လုပ်ပြီး **Run** နှိပ်ပါ။
4. **Table Editor** မှာ ဒီ table ၆ ခု ပေါ်ရမယ်:
   `profiles`, `brands`, `designs`, `generations`, `token_balances`, `usage_events`။
5. **Project Settings → API** မှာ ဒါတွေ copy လုပ်ထားပါ (ဒါက နောက်အဆင့်မှာ သုံးမယ်):
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key ကို **browser မှာ ဘယ်တော့မှ မသုံးပါနဲ့**၊
     server-only လိုမှ Vercel မှာ သီးသန့် ထည့်ပါ။

## အဆင့် ၃ — Vercel မှာ တင်ပါ

1. [Vercel](https://vercel.com/new) မှာ Sign in → **Import Git Repository** →
   ThuKha repo ကို ရွေးပါ။
2. Framework Preset: **Next.js** လို့ auto ပေါ်ရမယ် (မပေါ်ရင် ကိုယ်တိုင် ရွေးပါ)။
   Build Command / Output Directory ကို default အတိုင်း ထားပါ၊ ပြင်စရာ မလိုဘူး။
   `vercel.json` ဖိုင် မလိုပါဘူး — Vercel က Next.js ကို သူ့ဘာသာ သိတယ်။
3. **Environment Variables** မှာ ဒါတွေ ထည့်ပါ (Production ကို အနည်းဆုံး ရွေးပါ):

   | Variable | ဘာလဲ | ဥပမာ |
   |---|---|---|
   | `GEMINI_API_KEY` | Google AI Studio က key အသစ် (ပေါက်ကြားဖူးတဲ့ key မဟုတ်) — Gemini သုံးမှသာ လိုတယ် | (key အစစ်၊ chat ထဲ မပို့ပါနဲ့) |
   | `AI_BACKGROUND_MODEL` | Gemini ပုံမော်ဒယ် | `gemini-2.5-flash-image` |
   | `IMAGE_PROVIDER` | `cloudflare` = free Cloudflare, `gemini` = Gemini only, ဗလာ = auto | `cloudflare` |
   | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard က Account ID (Cloudflare သုံးမှသာ) | (account id) |
   | `CLOUDFLARE_API_TOKEN` | Workers AI:Read scope ပါတဲ့ API token, server-only (Cloudflare သုံးမှသာ) | (token, chat ထဲ မပို့ပါနဲ့) |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (login / server token အတွက် လိုတယ်) | `https://xyzcompany.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser login အတွက်) | (anon key) |
   | `SUPABASE_SERVICE_ROLE_KEY` | Server-only — API route တွေက token ဖြတ်ဖို့ သုံးတယ်၊ browser မှာ ဘယ်တော့မှ မသုံးရ | (service_role key) |

   Env var ထည့်ပြီးမှ **Deploy** နှိပ်ပါ။ Env var ကို နောက်မှ ပြင်ရင်
   **Redeploy** ပြန်လုပ်မှ အသစ်က အလုပ်လုပ်တယ်။
4. Deployment **Ready** ဖြစ်မှ link ကို ဖွင့်ပါ။

## အဆင့် ၃ (ခ) — Cloudflare free ပုံထုတ်နည်း (Gemini အစား)

Gemini ပုံမော်ဒယ်ရဲ့ free tier limit က 0 ဖြစ်နေလို့၊ ပိုက်ဆံ မကုန်ဘဲ
ပုံထုတ်ချင်ရင် Cloudflare Workers AI ကို သုံးပါ။

1. [Cloudflare](https://dash.cloudflare.com) မှာ Sign up / Sign in လုပ်ပါ
   (အလကား account ရတယ်)။
2. Dashboard မှာ **Account ID** ကို copy လုပ်ပါ (ညာဘက် အပေါ်နား၊
   ဒါမှမဟုတ် Workers AI → REST API စာမျက်နှာမှာ ပေါ်တယ်)။
3. **My Profile → API Tokens → Create Token** မှာ template
   **Workers AI** ကို ရွေးပြီး token တစ်ခု လုပ်ပါ (scope:
   Workers AI:Read)၊ token ကို တစ်ခါပဲ ပြမယ်၊ copy လုပ်ထားပါ။
4. `.env.local` မှာ (local) ဒါမှမဟုတ် Vercel Env မှာ (live) ဒါတွေ ထည့်ပါ:
   ```
   IMAGE_PROVIDER=cloudflare
   CLOUDFLARE_ACCOUNT_ID=သင့် account id
   CLOUDFLARE_API_TOKEN=သင့် token
   ```
   ပြီးရင် server ပြန် run / Vercel မှာ Redeploy လုပ်ပါ။
5. `/create` မှာ **Free mode (Cloudflare FLUX)** လို့ ပေါ်ရမယ်။
   Free limit: တစ်နေ့ 10,000 neurons လောက်၊ 4-step ပုံ 1024×1024
   ဆို တစ်နေ့ ပုံ 170 လောက် ထုတ်လို့ရတယ်၊ 00:00 UTC မှာ ပြန်ရတယ်။
6. **ကန့်သတ်ချက်:** Cloudflare FLUX က စာနဲ့ပဲ ပုံထုတ်လို့ရတယ်၊
   ကိုယ့်ပုံကို ပြင်လို့ မရဘူး — ပုံ ထည့်ထားရင် /create က
   ဖြုတ်ခိုင်းမယ်။ ပြီးတော့ width/height ကို Cloudflare က လက်မခံလို့
   ပုံတိုင်း စတုဂံပုံ (1024×1024) ပဲ ထွက်မယ် — Story/Cover
   အချိုးလိုချင်ရင် Gemini (paid, billing ချိတ်ပြီး)
   ကို ပြန်ပြောင်းရမယ် (`IMAGE_PROVIDER=gemini` + `GEMINI_API_KEY`)။
   Cloudflare ကနေ Gemini ကို အလိုလို ပြန်မပြောင်းပေးဘူး — free
   request က paid ဖြစ်သွားမှာ စိုးလို့ ရည်ရွယ်ပြီး မပြောင်းတာပါ။

## အဆင့် ၃ (ဂ) — Local မှာ အရင် စမ်းပါ၊ ပြီးမှ Vercel မှာ စမ်းပါ

Vercel မှာ တင်ခင် local မှာ အောင်မှ တင်ပါ — local မှာ မရရင်
Vercel မှာလည်း မရဘူး၊ local မှာ ရပြီး Vercel မှာ မရရင်
အများအားဖြင့် Env var ပြဿနာပဲ ဖြစ်တယ်။

**အဆင့် A — Local စမ်း (Cloudflare free)**
1. `npm install` လုပ်ပါ။
2. `thukha-platform/.env.local` မှာ ဒါတွေ ထည့်ပါ:
   ```
   IMAGE_PROVIDER=cloudflare
   CLOUDFLARE_ACCOUNT_ID=သင့် account id
   CLOUDFLARE_API_TOKEN=သင့် token
   ```
   (Gemini key မလိုဘူး။ Supabase မထည့်ရင် guest အနေနဲ့ စမ်းလို့ရတယ်။)
3. `npm run build` နဲ့ `npm run lint` အောင်မှ ဆက်ပါ။
4. `npm run dev` လုပ်ပြီး `http://localhost:3000/create` ကို ဖွင့်ပါ။
5. စစ်ရမယ့်အချက်တွေ:
   - **Free mode (Cloudflare FLUX)** လို့ ပေါ်ရမယ်။
   - Browser မှာ `http://localhost:3000/api/generate-background` ကို
     ဖွင့်ရင် `{"provider":"cloudflare","configured":true}` လို့ ပေါ်ရမယ်။
   - Prompt ရေးပြီး၊ **ပုံ မထည့်ဘဲ** (စာနဲ့ပဲ) **AI ပုံ ဖန်တီးပါ**
     နှိပ်ပါ — ပုံထွက်ရမယ်၊ token ဖြတ်သွားရမယ်၊ PNG download ရမယ်။
   - ပုံ ထည့်ပြီး နှိပ်ရင် reference မရဘူးလို့ သတိပေးရမယ်
     (Cloudflare ရဲ့ ကန့်သတ်ချက်၊ မှန်ပါတယ်)။
   - ပုံမထွက်ရင် error စာကို မှတ်ပါ: token မမှန်ရင် 401/403,
     neurons ကုန်ရင် 429 (00:00 UTC မှာ ပြန်ရတယ်)။
6. Local အောင်မှ server ကို ပိတ်ပါ (Terminal မှာ Ctrl+C)။

**အဆင့် B — Vercel မှာ တင်၊ ပြီးမှ စမ်း**
1. `git status` မှာ `.env.local` ပါမနေတာ စစ်ပါ၊ ပြီးမှ
   `git add -A`, `git commit`, `git push` လုပ်ပါ။
   ⚠️ `.env.local` က Vercel ကို အလိုလို မပါသွားဘူး —
   Vercel Env မှာ သီးသန့် ပြန်ထည့်ရမယ်။
2. Vercel မှာ Import လုပ်ပြီး Env Variables မှာ အဆင့် A က
   အတိုင်း ၃ ခုလုံး ထည့်ပါ (Production scope ကို ရွေးပါ)၊
   Supabase သုံးရင် Supabase var တွေပါ ထည့်ပါ။
3. **Deploy** → **Ready** ဖြစ်မှ link ကို ဖွင့်ပါ။
   Env ပြင်တိုင်း **Redeploy** ပြန်လုပ်ရတယ်။
4. Live မှာ အဆင့် A အတိုင်း ပြန်စစ်ပါ:
   - Live link + `/api/generate-background` မှာ
     `{"provider":"cloudflare","configured":true}` ပေါ်ရမယ်။
   - `/create` မှာ Free mode ပေါ်ရမယ်၊ စာနဲ့ပဲ ပုံထုတ်ကြည့်ပါ။
5. **Local ရပြီး Live မရရင် စစ်ရမယ့်အချက်:**
   - Vercel Env မှာ `IMAGE_PROVIDER`, `CLOUDFLARE_ACCOUNT_ID`,
     `CLOUDFLARE_API_TOKEN` ၃ ခုလုံး ရှိမရှိ၊ စာလုံးမှားမမှား၊
     space ပါမပါ။
   - Env ထည့်ပြီးမှ Deploy / Redeploy လုပ်ခဲ့မလား။
   - Live link ရဲ့ `/api/generate-background` က `configured:false`
     ပြနေရင် Env မရောက်သေးလို့ ဖြစ်တယ်။

## အဆင့် ၄ — Live site မှာ စစ်ပါ

- `/` ဖွင့်တယ်၊ ThuKha home ပေါ်တယ်။
- `/create` မှာ business type / name / goal / channel ရွေးတယ်။
- Prompt ရေးပြီး **Prompt suggestions** နှိပ်ရင် suggestion ၃ ခု ပေါ်တယ်
  (ဒါက key မလိုဘူး)။
- **AI ပုံ ဖန်တီးပါ** နှိပ်ရင် ပုံထွက်တယ်၊ Token ကုန်သွားတယ်
  (ဥပမာ 15 token)၊ ပုံကို PNG download လုပ်လို့ရတယ်။
- Token 0 ဖြစ်ရင် error box ထဲမှာ guest ဆိုရင် **Token 100 ပြန်ဖြည့် (စမ်းသပ်ဖို့သာ)**
  ခလုတ် ပေါ်မယ်။ Login ထားတဲ့ account ဆိုရင် server token ဖြစ်လို့ အဲဒီခလုတ်နဲ့
  ပြန်ဖြည့်လို့ မရဘူး။ အဲဒီခလုတ်ကို အစစ်မထုတ်ခင် ဖြုတ်ရမယ်။
- `/signup` မှာ signup လုပ်ပြီး `/login` မှာ login လုပ်ရင် header မှာ email ပေါ်ပြီး
  /create မှာ **Server (login)** လို့ ပြမယ်။ Supabase Auth မှာ Confirm email ON
  ထားရင် email confirm လုပ်ပြီးမှ login ရမယ် (dev မှာ OFF လုပ်ထားလို့ရတယ်)။
- **Email confirmation သေချာလုပ်ဖို့ (Supabase ဘက်မှာ ၃ ခု စစ်ပါ):**
  1. **Authentication → Sign In / Providers → Email** မှာ Email ON နဲ့
     **Confirm email ON** ဖြစ်နေရမယ် (OFF ဆိုရင် confirm email ပို့မှာ မဟုတ်ဘူး၊
     signup ပြီးတာနဲ့ /create ကို တိုက်ရိုက် သွားမယ်)။
  2. **Authentication → URL Configuration → Site URL** ကို live domain အတိအကျ
     ထားပါ (ဥပမာ `https://thukha-platform.vercel.app` — localhost မဟုတ်ဘူး)။
  3. **Redirect URLs** မှာ ဒီ ၂ ခုလုံး ထည့်ပါ:
     `https://thukha-platform.vercel.app/auth/confirm` နဲ့
     `http://localhost:3000/auth/confirm` (local စမ်းဖို့)။
     Signup က emailRedirectTo ကို `/auth/confirm` အတိအကျ ပို့ထားလို့၊
     ဒီ URL တွေ မရှိရင် Supabase က link ကို ပိတ်ထားနိုင်တယ်။
     Confirm link ကို နှိပ်ရင် `/auth/confirm` က code / hash နှစ်မျိုးလုံးကို
     ကိုင်ပြီး session ရရင် `/create` ကို သွားမယ်၊ link ကုန်သွားရင်
     Signup ကနေ **Confirm email ပြန်ပို့ပါ** နဲ့ ပြန်ပို့လို့ရတယ်။
- `/brands` မှာ Brand ထည့်လို့ရပြီး၊ `/designs` မှာ /create ကနေ သိမ်းထားတဲ့
  Design တွေ ပေါ်မယ်။
- **Admin (role ခွဲခြားမှု — သေချာ):** Admin account နဲ့ Customer account ကို
  **သီးခြား email ၂ ခု** နဲ့ ထားပါ၊ ရောမသုံးပါနဲ့။
  1. Admin ဖြစ်စေချင်တဲ့ email နဲ့ အရင် `/signup` မှာ account လုပ်ပါ၊
     ပြီးရင် `/login` နဲ့ တစ်ခါ ဝင်ပြီး `/create` ကို ဖွင့်ပါ (profiles row
     ဖြစ်လာဖို့)။
  2. Supabase **SQL Editor** မှာ ဒါကို run ပါ (email ကို admin ဖြစ်စေချင်တဲ့
     email နဲ့ အစားထိုးပါ) — profiles row မရှိသေးရင်တောင် admin အဖြစ်
     ထည့်ပေးတယ်။
     ```
     insert into public.profiles (id, role)
     values ((select id from auth.users where email = 'admin@example.com'), 'admin')
     on conflict (id) do update set role = 'admin';
     ```
  3. ပြီးရင် **`/login` မှာပဲ** အဲဒီ account နဲ့ login လုပ်ပါ —
     Login စာမျက်နှာတစ်ခုတည်းပဲ ရှိတယ်၊ admin login သီးသန့် မရှိတော့ဘူး။
     Role ပေါ် မူတည်ပြီး admin ဆိုရင် `/admin` ကို၊ customer ဆိုရင်
     `/create` ကို အလိုလို သွားမယ်။ `/admin` မှာ users + token +
     generations တွေ မြင်ရမယ်။ (`/admin/login` ကို ဖွင့်ရင် `/login` ကို
     အလိုလို ပြန်သွားမယ်။)
  4. **ခွဲခြားမှု:** Login စာမျက်နှာ တစ်ခုတည်းပေမဲ့၊ `/admin` API တွေက
     server ဘက်မှာ role ကို စစ်ပြီး customer ဆို 403 ပြန်တယ်၊
     `/admin` စာမျက်နှာကလည်း customer data ကို မပြဘူး။ Customer
     account နဲ့ login လုပ်ပြီး `/admin` ကို ရိုက်ဖွင့်ရင်လည်း data
     မြင်ရမှာ မဟုတ်ဘူး။
  5. **အရေးကြီး — schema.sql ကို ပြန်လည် run ပါ:** အရင် schema က
     browser key နဲ့ ကိုယ့် row ကို ပြင်လို့ရတဲ့ `FOR ALL` policy ဖြစ်နေလို့၊
     customer က တိုက်ရိုက် Supabase ခေါ်ပြီး `role='admin'` လို့
     ပြောင်းတာ ဒါမှမဟုတ် ကိုယ့် token balance ကို တိုးတာမျိုး လုပ်လို့ရခဲ့တယ်။
     အခု schema က browser key ကို **ဖတ်ရုံပဲ** ခွင့်ပြုတယ်၊ ရေးတာ/
     ပြင်တာ/ဖျက်တာအားလုံး server API (service_role) ကနေပဲ လုပ်တယ်။
     ဒါကြောင့် `schema.sql` အသစ်ကို SQL Editor မှာ တစ်ခါ ပြန် run မှ
     ဒီကာကွယ်မှု အလုပ်လုပ်မယ်။ Signup ကနေ admin ဖြစ်လို့ မရဘူး —
     ဒါက ရည်ရွယ်ချက်ပါ။
- **Admin token ပြန်ဖြည့် (prototype):** `/admin` မှာ user တစ်ယောက်ချင်းစီရဲ့
  ဘေးမှာ amount ရိုက်ပြီး **Token ဖြည့်ပါ** နှိပ်ရင် အဲဒီ amount ကို
  သူ့ရဲ့ server balance ထဲ ပေါင်းပေးတယ် (1–10000 အတွင်း)၊
  `usage_events` ထဲမှာ `admin_token_refill` လို့ မှတ်တယ်။
  အစစ်မထုတ်ခင် ဒါကို ငွေချေမှုနဲ့ အစားထိုးရမယ်။

## ပြဿနာ ဖြေရှင်းနည်း

| ပြဿနာ | အကြောင်းရင်းနဲ့ ဖြေရှင်းနည်း |
|---|---|
| `Gemini key မရှိသေးပါ` (503) | Vercel Env မှာ `GEMINI_API_KEY` မရှိတာ၊ ဒါမှမဟုတ် ထည့်ပြီးမှ Redeploy မလုပ်တာ။ Env စစ် → Redeploy လုပ်ပါ။ |
| `Gemini key မမှန်ပါ / ပိတ်ထားပါတယ်` (502) | အဟောင်း (အရင် ပေါက်ကြားဖူးတဲ့ key) ဒါမှမဟုတ် မှားနေတဲ့ key ကို သုံးနေတာ။ AI Studio မှာ key အသစ် လုပ်ပြီး အစားထိုးပါ၊ server ပြန် run / Redeploy လုပ်ပါ။ |
| `Gemini model မတွေ့ပါ` (502) | `AI_BACKGROUND_MODEL=gemini-2.5-flash-image` ဖြစ်မဖြစ် စစ်ပါ။ |
| `quota / rate limit ပြည့်သွားပြီ` (502) | Gemini free tier မှာ image quota က 0 ဖြစ်နေလို့ စောင့်လည်း မရဘူး။ `IMAGE_PROVIDER=cloudflare` ကို ပြောင်းပါ၊ ဒါမှမဟုတ် Gemini billing (Tier 1) ချိတ်ပါ။ |
| Build failed | ကိုယ့်ကွန်ပျူတာမှာ `npm run build` ပြန်စစ်ပါ။ အဲဒီမှာ အောင်မှ push / deploy လုပ်ပါ။ |
| ပုံထုတ်တိုင်း Token မဖြတ်ဘူး | ပုံမအောင်ရင် မဖြတ်ပါဘူး — ဒါက ရည်ရွယ်ချက်ပါ။ အောင်မြင်တဲ့ပုံမှသာ ဖြတ်တယ်။ |
| Token 0 ဖြစ်ပြီး ပြန်မရဘူး | Browser တစ်ခုချင်းစီမှာ သီးသန့် သိမ်းထားလို့ device / browser ပြောင်းရင် 100 ပြန်စတယ်။ Live မှာ စမ်းသပ်ဖို့ error box ထဲက ပြန်ဖြည့် ခလုတ်ကို သုံးပါ။ |
| Supabase table မပေါ်ဘူး | `schema.sql` ကို Run နှိပ်ပြီးမှ error ရှိမရှိ စစ်ပါ။ Error ရှိရင် အဲဒီ error စာကို ပို့ပေးပါ။ |
| `.env.local` ကို Vercel မှာ သုံးလို့မရဘူး | မှန်တယ် — `.env.local` က ကိုယ့်ကွန်ပျူတာမှာပဲ အလုပ်လုပ်တယ်။ Vercel မှာ Env Variables ထဲကနေ သီးသန့် ထည့်ရမယ်။ |

## နောက်အဆင့် (ဒီမှာ မပါသေးဘူး)

- ပုံတွေကို Supabase Storage bucket (`generated`) ထဲ သိမ်းတာ — အခု Designs က
  prompt / channel / format ပဲ သိမ်းထားတယ်။
- Token ဝယ်ဖြည့်တဲ့ ငွေချေမှု (KBPay / WavePay / PromptPay) — အခု guest အတွက်
  စမ်းသပ်ခလုတ်ပဲ ရှိတယ်၊ login account အတွက် ဝယ်ဖြည့်စနစ် မရှိသေးဘူး။

# ThuKha Platform — Context for Gemini

Read this file FIRST, before changing any code. It is the whole
context a new AI needs to work on this project without restarting
settled decisions. (Supersedes the older HANDOVER.md from
2026-11-03, which is now out of date.) Also read `AGENTS.md` in
this repo — it says this Next.js version has breaking changes
and to read the relevant guide in `node_modules/next/dist/docs/`
before writing Next.js code.

## 1. What this is

ThuKha Platform: a Myanmar-business AI promo-post SaaS.
A customer picks a business type, goal and channel, types a
headline / subheadline / business name, generates an AI
background image, then downloads a PNG with correct Burmese
text on it. Tagline: "သင့်လုပ်ငန်းကို AI နဲ့ တိုးတက်စေမယ်".
Launch window: 1–7 December 2026. This is a prototype in
pre-launch: launch Batch 1 and Batch 2 are built, Batch 3
remains (see §7). Test-only buttons and prototype notes must
be removed before a real launch.

## 2. Stack and how to run it

- Next.js 16.4.3, React 19.3.0, TypeScript, Tailwind CSS v4
  (CSS `@theme` in `src/app/globals.css`, no tailwind.config
  file), App Router, code under `src/`.
- Backend: Supabase (own project `thukha-platform`, Singapore
  region, NOT X-Panda's project) + Next.js API routes under
  `src/app/api/`. Live domain: `thukha-platform-tagc.vercel.app`.
- Image provider: Cloudflare Workers AI, model
  `@cf/black-forest-labs/flux-1-schnell`, square 1024×1024 JPEG
  only, ~170 images/day free, resets 00:00 UTC.
  Gemini free image quota is 0 — do NOT switch back to Gemini
  unless billing is linked. Meta Muse Image was researched and
  declined — do NOT add it unless the owner asks again.
- Run locally: `npm install`, then `npm run dev`.
  Always run `npm run lint` and `npm run build` before handing
  code back. Lint currently has 6 pre-existing warnings and
  0 errors — do not introduce new errors.
- Repo: `https://github.com/Olaryhlaing/thukha-platform.git`.
  The owner's working copy is `D:\thukha-platform-fresh` on
  his Windows PC. Local HEAD as of 2026-11-14: `dcbe291`.

## 3. Environment variables (NEVER ask for or paste a key in chat)

Keys live ONLY in `.env.local` (local) and Vercel Environment
Variables (production). Never commit them, never paste them
into an AI chat, never put them in this file.
- `IMAGE_PROVIDER=cloudflare`
- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`
  (Workers AI:Read scope)
- `NEXT_PUBLIC_SUPABASE_URL` (bare `https://xxxx.supabase.co`,
  no `/rest/v1` suffix), `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `GEMINI_API_KEY` only if Gemini is ever used again (see §2).
- `.env.example` must stay empty of real keys.

## 4. Key files and routes

- `/` is the login page (visitors → `/login`, customers →
  `/create`, admins → `/admin`, via unified `/login` + server
  `/api/me` role check). There is no public landing page.
  `/admin/login` only redirects to `/login` — it is NOT a
  separate admin login.
- `/login`, `/signup` (name required, password min 8, duplicate
  email blocked: Supabase returns an existing user with an
  empty `identities` list — that is the signal, NOT an error),
  `/forgot-password`, `/auth/reset-password`, `/auth/confirm`.
- `/create`: business type / goal / business name / channel →
  overlay text → AI image → preview → download.
  Channels: Facebook post, Story, Cover, Menu/product card.
  Overlay text is drawn in the browser (headline, subheadline,
  business name are three separate draggable layers, default
  font Padauk) — this is what guarantees 100% correct Burmese.
  AI-text mode (toggle, default ON) lets the AI draw the text
  inside the image instead — WARNING: AI-drawn Burmese may
  garble, so the user must check before downloading.
  Also on /create: caption generator (template, not AI),
  announcements banner, maintenance notice.
- `/designs`: saved prompt records only (no image blobs yet)
  + generation history with regenerate links.
- `/support`: FAQ (accordion, 6 questions) + ticket form +
  my tickets with status + admin reply. Desktop (lg+):
  two columns — form + my tickets left, FAQ 380px sticky
  right. Customers/guests only — admins are redirected to
  `/admin/support`.
- `/account`: profile edit (name, password), profile picture
  (bucket `avatars`, max 2 MB), token history (low-balance
  warning under 20), account deletion (two-step, permanent —
  never test with the owner's real admin account).
- `/privacy`: bilingual privacy policy.
- `/brands`: REMOVED (page deleted, `/brands` 404s).
  `/api/brands` and the brands table are kept, but no UI
  calls them. Do NOT re-add the Brands page unless the owner
  explicitly asks. Brand presets belong INSIDE /create.
- `/templates`: page EXISTS again (GitHub `e4abcd9` version).
  `src/lib/templates.ts` and `/create?template=<id>` prefill.
- `/admin`: admin dashboard — stats, users (suspend/flag,
  token refill), generations, health (quota estimate
  = max(0, 170 − today's generations), failure rate), export
  CSV, maintenance toggle. NO support section and NO audit
  section anymore — those moved to their own tabs.
- `/admin/support`: dedicated admin support inbox — reply +
  status open/in_progress/resolved, audit-logged. Resolved is
  terminal (no reopen): reply box and both buttons disabled,
  server PATCH returns 400 on resolved tickets.
- `/admin/audit`: dedicated audit-log page, latest 100
  entries (dashboard used to show 50).
- Header: `src/components/SiteHeader.tsx` — sticky top-0,
  own solid colour (light `#EDE9FE` lavender, dark `#1A1740`
  deep indigo-violet — distinct from the body). Center nav:
  Create, Designs, Admin (admin-only), Support Inbox
  (admin-only, `/admin/support`), Audit Log (admin-only,
  `/admin/audit`), Support (customers/guests only). Right:
  notification bell, language toggle, theme toggle, profile
  pill + Logout (far right). Mobile: hamburger menu.
  Footer: `src/components/SiteFooter.tsx` — fixed bottom,
  same colours as the header.
- Notifications: in-app bell in the header (unread badge,
  dropdown shows latest 4, "show more" reveals 4 older at
  a time). Customer gets: ticket reply/resolved, token
  refill, suspend/unsuspend, new announcement. Admin gets:
  new ticket, new user signup. NO email, NO phone push.
- Maintenance mode: admin dashboard toggle. When ON, login
  + signup are closed for customers (`/login` shows a
  notice; a customer who signs in is signed straight back
  out after the role check; `/signup` form is blocked).
  Admins log in normally through `/login` and can reopen it.
  Already-logged-in users stay logged in. App-level gate
  only, not a Supabase Auth-level block.

## 5. Tokens, guests, admins

- `src/lib/tokens.ts`: base 10 + 5 per reference image (max
  +15) + 5 for Story/Cover + 5 for prompt >120 chars = 10–35
  per successful image. Deduct ONLY on success (atomic).
- Customers start at 100 server tokens. Guests start at 50
  browser tokens, 1 successful image per browser, no download
  (watermarked preview, Login CTA instead of PNG buttons).
  Honest limit: no website can block OS screenshots.
- Admins: unlimited, no pre-check, no deduction.
- Pricing (CONFIRMED business decision, 2026-11-04):
  monthly token = 10 MMK, top-up token = 15 MMK with No
  Expiry. Plans (monthly): Mini 15,000 MMK = 1,500 tokens,
  Starter 35,000 = 3,500, Pro 70,000 = 7,000, Agency
  150,000 = 15,000. Payment / plan purchase / paid top-up
  is NOT built yet — the app still only has the prototype
  admin refill and guest test refill. Do NOT invent a
  payment system without being asked.
- Test-only guest refill and prototype admin refill buttons
  still exist in code — remove/replace them with a paid
  top-up before a real launch.

## 6. Database — 12 public tables

`supabase/schema.sql` is the whole schema. Tables: profiles,
brands, designs, generations, token_balances, usage_events,
generation_failures, audit_logs, announcements,
support_tickets, notifications, app_settings (key/value,
`maintenance` = 'true' means maintenance mode is on).
RLS target: browser keys SELECT-only, own rows; all writes
via server APIs (service_role). RULE: whenever a change needs
a schema change, say FIRST that the owner must paste the
whole `supabase/schema.sql` into Supabase Dashboard → SQL
Editor and Run it (safe to re-run; all changes are "add if
missing" migrations), and only then give the code pack.
Verify with: `select table_name from
information_schema.tables where table_schema='public' order
by table_name;`

## 7. Current state and open items (as of 2026-11-14)

- Done: launch Batch 1 (caption, token history, generation
  history, admin export, admin health) and Batch 2 (suspend,
  flagging, failure logging, audit log, announcements);
  customer support + admin inbox + header tabs; notifications
  bell; maintenance mode; duplicate-signup block; Burmese UI
  pass (when lang=my, UI is Burmese; business-type/goal
  values stay Burmese as data; channel ids, Token, AI, PNG,
  Supabase/Cloudflare/Gemini names stay English); header/
  footer colours; support two-column layout; FAQ accordion.
- NOT built (Batch 3, pre-launch): Supabase Storage for
  saved images (designs still save prompt records only),
  brand preset + logo INSIDE /create (do NOT restore the
  /brands page), own templates/favourites.
- Open, owner-side: re-run the updated `supabase/schema.sql`
  (covers the notifications table and the `app_settings`
  table) and verify; Supabase Auth settings (Confirm email
  ON, Site URL = live domain, Redirect URLs for
  `/auth/confirm` and `/auth/reset-password`); the Gmail
  signup failure was a Supabase confirmation-email sending
  failure (SMTP misconfigured/not saved, or the default
  service failing) — code cannot fix it; the owner must fix
  SMTP in the Supabase dashboard OR turn Confirm email OFF
  as a prototype workaround, and fix SMTP properly before
  the December launch.
- Known deployment trap: a zip / file copy that does not
  actually overwrite `D:\thukha-platform-fresh` will still
  show old code live, even with correct timestamps. Always
  verify by content (`Select-String` for the new string),
  NOT by file date, before committing. After every push,
  check Vercel for a new Ready Production row, then hard-
  refresh and test in Chrome/Safari (NOT in Telegram's
  in-app browser — it caches old pages).

## 8. Rules that must NOT be broken

- The owner (Olary) creates accounts, pushes and deploys
  himself. Prepare code and instructions only — never push,
  deploy, or create accounts / API keys for him, unless he
  explicitly asks for that one scoped action by name.
- Two GitHub identities, kept separate: school `6705140040`
  (untouched) vs personal `Olaryhlaing`. In project clones,
  set git author LOCALLY only (`Olaryhlaing`,
  `Olaryhlaing@users.noreply.github.com`), or Vercel blocks
  deploys.
- Never rewrite, delete or claim reliability for user data.
  Never delete a generation / brand / design unless the owner
  explicitly asks, with the exact item named.
- Do NOT add story points anywhere.
- Do NOT promise correct Burmese inside an AI-drawn image.
  Overlay mode is the safe mode for Burmese.
- Do NOT connect the Vercel Storage / Supabase integration —
  it injects mismatched variable names and may point at the
  wrong database.
- Work one small task at a time. Show the exact diff, let the
  owner read it, test in the browser, and only then move on.
  Never restart settled scope, never re-argue a feature the
  owner just cancelled (e.g. Brands page, landing page,
  Muse Image, generation deletion).

## 9. How to start a task in Gemini (copy this prompt)

> You are working on ThuKha Platform. Read GEMINI.md in the
> repo root first, then do ONLY this task: [one task, e.g.
> "On /create, show X when Y"]. Do not change anything else.
> Show me the exact diff, run `npm run lint` and
> `npm run build`, and tell me the result before I push.
> Do not push, deploy, or create any account or API key.
> Do not paste or ask for any secret key.

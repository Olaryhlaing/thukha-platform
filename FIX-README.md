# Token debug v3 — 2026-11-04 (cumulative, includes v1+v2)
Evidence: new customer Olary (amhappleph@gmail.com) shows
100 Tokens in /account, but /create shows 0 / 100 even after
clicking "Token ပြန်စစ်", with "Token ဖတ်လို့ မရပါ" below it.
Expected behaviour (confirmed by the user, already the design):
new customer = 100 / 100, then deduct as used (e.g. 100 -> 90
after a 10-token image, 100 -> 85 after 15, etc.), never 0/100
while the account has 100.
What changed (2 files, no Supabase step):
- src/app/api/tokens/route.ts: guest answers now carry a reason
  ("no_user" = browser token did not verify, "no_service" =
  server env missing). No secret, no token value.
- src/app/create/page.tsx: Refresh no longer shows only the
  generic failed message. It now shows HTTP status and the
  server reason, e.g. "(no_user)", "(HTTP 500, response not
  JSON)", so one click tells whether the token expired, the
  server crashed, or the fetch never reached the server.
Apply: overwrite the 2 files in D:\thukha-platform-fresh
(this create page already contains Batch 1 + v1 + v2, so it can
overwrite any of those), commit, push, Vercel Ready.
Test:
1. /create -> click "Token ပြန်စစ်" -> tell me the EXACT message
   under the pill (including the bracket part).
   - If it becomes 100 / 100: fetch is fixed, generate an image
     and check it drops to 90 / 100 (10-token post).
   - If it shows "(no_user)": log out, log back in, click
     Refresh again — the old session token had expired.
   - If it shows "(HTTP 500...)" or "(no_service)": check
     Vercel -> Deployments -> latest -> Functions -> /api/tokens
     log and send that error (no keys in it).

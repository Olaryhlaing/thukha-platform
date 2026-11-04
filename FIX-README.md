# Token pill stale fix — 2026-11-04
Symptom: /account shows 300 Tokens, /create still shows 0 / 100
for the same customer (Hlaing, hlaingolary@gmail.com).
Root cause (NOT a DB error): /api/me (used by /account) and
/api/tokens (used by /create) both read the SAME token_balances
row for the same user id, so a fresh load cannot differ. The old
/create code fetched tokens ONLY on first mount — a tab opened
BEFORE an admin refill kept the old balance until a hard reload.
The code comment even said a refill "needs a page reload".
Fix (this file only, src/app/create/page.tsx): the token fetch
is now also run on window focus, on pageshow (Back button /
bfcache restore), and when the tab becomes visible again.
A failed refresh keeps the last known balance, it never blanks
the pill.
Apply: overwrite src/app/create/page.tsx in D:\thukha-platform-fresh,
commit, push, Vercel Ready, then test below.
Test (no new Supabase step):
1. Open /create, note the pill. In /admin, refill the customer.
2. Go back to the SAME /create tab (click Create, or switch tabs)
   — the pill must update to the new balance WITHOUT Ctrl+Shift+R.
3. /account must still show the same balance as /create.
Workaround on the CURRENT live version (before this fix):
hard reload /create with Ctrl+Shift+R — the pill should already
become 300 / total on a fresh load. If it still shows 0 / 100
after a hard reload, that is a different bug — send a fresh
/create screenshot after the hard reload.

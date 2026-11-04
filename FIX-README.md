# Token pill v2 — 2026-11-04 (cumulative: includes v1 focus/pageshow refresh)
Symptom, twice: /account shows 300, then 400 Tokens, /create still
shows 0 / 100 for the same customer (Hlaing, hlaingolary@gmail.com).
Correction to the earlier diagnosis: the pill text "Server (login)"
is HARDCODED in the render — it does NOT prove the server fetch
succeeded. A 0/100 pill can be browser guest tokens (which can be
0) after a failed/stale server fetch, with the server word still
showing. That is why hard reload alone is not a reliable test.
What is in this pack (2 files only):
- src/app/create/page.tsx: a "Token ပြန်စစ်" (Refresh) button next
  to the pill. Clicking it refetches /api/tokens on demand and
  updates the pill. If the server answers guest mode while logged
  in, or the fetch fails, a warning appears instead of a silent 0.
  Plus v1: refetch on tab focus, pageshow (Back button), and when
  the tab becomes visible again.
- src/lib/i18n.ts: my+en keys for the button and warnings.
No Supabase step.
Apply AFTER Batch 1 and after v1 (this create page already
contains both, so it can overwrite either): overwrite the 2 files
in D:\thukha-platform-fresh, commit, push, Vercel Ready.
Test:
1. /create -> click "Token ပြန်စစ်" -> pill must become
   400 / total (total >= 400), not 0 / 100.
2. If the warning "Server က Token ဖတ်လို့ မရဘူး" appears, log
   out and back in, then click Refresh again — if it STILL
   shows the warning, the server fetch itself is failing and
   that is the next bug to fix (not the pill).
3. Immediate workaround without this pack: log out, log back in,
   open /create in a NEW tab — a fresh session forces a fresh
   server fetch. If that also shows 0/100, do step 2's warning
   check after this pack is live.
